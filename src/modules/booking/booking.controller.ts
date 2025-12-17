import { Request, Response } from "express";
import { bookingService } from "./booking.service";
import { pool } from "../../config/db";

const createBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingService.createBooking(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBookings = async (req: Request, res: Response) => {
  try {
    const result = await bookingService.getBookings(req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const result = await bookingService.updateBooking(
      bookingId as string,
      req.body
    );

    let message = "Booking updated successfully";
    if (status === "returned") {
      message = "Booking marked as returned. Vehicle is now available";
    } else if (status === "cancelled") {
      message = "Booking cancelled successfully";
    }

    res.status(200).json({
      success: true,
      message: message,
      data: result,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const bookingController = { createBooking, getBookings, updateBooking };
