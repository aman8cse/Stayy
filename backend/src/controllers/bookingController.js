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

export async function listForHost(req, res) {
  const bookings = await bookingService.listBookingsForHost(req.user.id);
  res.status(200).json({
    success: true,
    bookings,
  });
}

export async function cancel(req, res) {
  const booking = await bookingService.cancelBooking(req.user.id, req.params.bookingId);
  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    booking,
  });
}
