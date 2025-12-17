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
  if (role === "admin") {
    const result = await pool.query("SELECT * FROM bookings");
    return result.rows;
  }

  if (role === "customer") {
    const query = "SELECT * FROM bookings WHERE customer_id = $1";
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
};

const updateBooking = async (bookingId: string, payload: any) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateQ = `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`;
    const booking = await client.query(updateQ, [payload.status, bookingId]);

    if (payload.status === "returned" || payload.status === "cancelled") {
      const vehicleId = booking.rows[0].vehicle_id;
      await client.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [vehicleId]
      );
    }

    await client.query("COMMIT");
    return booking.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const bookingService = { createBooking, getBookings, updateBooking };
