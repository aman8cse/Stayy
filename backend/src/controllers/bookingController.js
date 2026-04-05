import * as bookingService from '../services/bookingService.js';

export async function create(req, res) {
  const booking = await bookingService.createBooking(req.user.id, req.body);
  res.status(201).json({
    success: true,
    booking,
  });
}

export async function listForUser(req, res) {
  const bookings = await bookingService.listBookingsForUser(req.user.id);
  res.status(200).json({
    success: true,
    bookings,
  });
}
