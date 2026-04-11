import { canCancelBooking, getBookingTimelineStatus } from './bookingLifecycle.js';

/**
 * @param {import('mongoose').LeanDocument<any> | any} booking
 * @param {Date} [now]
 */
export function toClientBooking(booking, now = new Date()) {
  return {
    ...booking,
    listing: booking?.listing ?? booking?.unit?.listing ?? null,
    timelineStatus: getBookingTimelineStatus(booking, now),
    canCancel: canCancelBooking(booking, now),
  };
}
