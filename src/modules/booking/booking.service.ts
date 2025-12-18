import { pool } from "../../config/db";

const createBooking = async (userId: number, payload: any) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { vehicle_id, rent_start_date, rent_end_date } = payload;

    const vRes = await client.query(
      `SELECT * FROM vehicles WHERE id = $1 AND availability_status = 'available'`,
      [vehicle_id]
    );
    if (vRes.rows.length === 0) throw new Error("Vehicle unavailable");
    const vehicle = vRes.rows[0];

    const start = new Date(rent_start_date).getTime();
    const end = new Date(rent_end_date).getTime();
    const days = (end - start) / (1000 * 3600 * 24);
    const total_price = days * parseFloat(vehicle.daily_rent_price);

    const insertQuery = `
      INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
      VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`;
    const booking = await client.query(insertQuery, [
      userId,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price,
    ]);

    await client.query(
      `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
      [vehicle_id]
    );

    await client.query("COMMIT");

    return {
      ...booking.rows[0],
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getBookings = async (userId: number, role: string) => {
  const client = await pool.connect();

  try {
    const currentTime = new Date().toISOString();

    const expiredBookings = await client.query(
      `SELECT id, vehicle_id FROM bookings WHERE status = 'active' AND rent_end_date < $1`,
      [currentTime]
    );

    if (expiredBookings.rows.length > 0) {
      await client.query("BEGIN");
      try {
        for (const booking of expiredBookings.rows) {
          await client.query(
            `UPDATE bookings SET status = 'returned' WHERE id = $1`,
            [booking.id]
          );
          await client.query(
            `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
            [booking.vehicle_id]
          );
        }
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("Auto-return system failed:", err);
      }
    }

    if (role === "admin") {
      const result = await client.query("SELECT * FROM bookings");
      return result.rows;
    }

    if (role === "customer") {
      const query = "SELECT * FROM bookings WHERE customer_id = $1";
      const result = await client.query(query, [userId]);
      return result.rows;
    }
  } finally {
    client.release();
  }
};

const updateBooking = async (
  bookingId: string,
  userId: string,
  role: string,
  payload: Record<string, any>
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const allowedStatuses = ["active", "cancelled", "returned"];

    if (!payload.status || !allowedStatuses.includes(payload.status)) {
      throw new Error(
        `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}`
      );
    }

    const checkQuery = `SELECT * FROM bookings WHERE id = $1`;
    const checkResult = await client.query(checkQuery, [bookingId]);

    if (checkResult.rows.length === 0) {
      throw new Error("Booking not found");
    }

    const existingBooking = checkResult.rows[0];

    if (role === "customer") {
      if (existingBooking.customer_id !== userId) {
        throw new Error("You are not authorized to modify this booking");
      }

      if (payload.status !== "cancelled") {
        throw new Error("Customers can only cancel bookings");
      }

      const startTime = new Date(existingBooking.rent_start_date).getTime();
      const currentTime = new Date().getTime();

      if (currentTime >= startTime) {
        throw new Error(
          "You cannot cancel a booking once the rental period has started"
        );
      }
    }

    const updateQ = `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`;
    const booking = await client.query(updateQ, [payload.status, bookingId]);
    const bookingData = booking.rows[0];

    if (payload.status === "returned" || payload.status === "cancelled") {
      const vehicleId = bookingData.vehicle_id;
      await client.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [vehicleId]
      );
    }

    await client.query("COMMIT");

    if (payload.status === "returned") {
      return {
        ...bookingData,
        vehicle: {
          availability_status: "available",
        },
      };
    }

    return bookingData;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const bookingService = { createBooking, getBookings, updateBooking };
