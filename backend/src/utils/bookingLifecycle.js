import { bookingWindow } from './bookingDatetime.js';

/**
 * @param {{ status?: string; startDate: Date; endDate: Date; startTime: string; endTime: string }} booking
 * @param {Date} [now]
 */
export function getBookingTimelineStatus(booking, now = new Date()) {
  if (booking?.status === 'cancelled') {
    return 'cancelled';
  }

  const { start, end } = bookingWindow(booking);

  if (now >= end) {
    return 'completed';
  }

  if (now >= start) {
    return 'in_progress';
  }

  return 'upcoming';
}

/**
 * @param {{ status?: string; startDate: Date; endDate: Date; startTime: string; endTime: string }} booking
 * @param {Date} [now]
 */
export function canCancelBooking(booking, now = new Date()) {
  if (booking?.status !== 'confirmed') {
    return false;
  }

  const { start } = bookingWindow(booking);
  return now < start;
}
