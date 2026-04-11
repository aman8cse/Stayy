export function getBookingTimelineStatus(booking, now = new Date()) {
  if (booking?.timelineStatus) {
    return booking.timelineStatus;
  }

  if (booking?.status === 'cancelled') {
    return 'cancelled';
  }

  const start = toBookingDate(booking?.startDate, booking?.startTime);
  const end = toBookingDate(booking?.endDate, booking?.endTime);

  if (!start || !end) {
    return 'upcoming';
  }

  if (now >= end) {
    return 'completed';
  }

  if (now >= start) {
    return 'in_progress';
  }

  return 'upcoming';
}

export function getBookingStatusLabel(booking, now = new Date()) {
  const status = getBookingTimelineStatus(booking, now);
  if (status === 'in_progress') return 'In Progress';
  if (status === 'completed') return 'Completed';
  if (status === 'cancelled') return 'Cancelled';
  return 'Upcoming';
}

export function canCancelBooking(booking, now = new Date()) {
  if (typeof booking?.canCancel === 'boolean') {
    return booking.canCancel;
  }

  return booking?.status === 'confirmed' && getBookingTimelineStatus(booking, now) === 'upcoming';
}

export function matchesBookingFilter(booking, filter) {
  if (filter === 'all') return true;
  return getBookingTimelineStatus(booking) === filter;
}

function toBookingDate(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;

  let normalizedDate;
  if (typeof dateValue === 'string') {
    normalizedDate = dateValue.slice(0, 10);
  } else {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }
    normalizedDate = parsedDate.toISOString().slice(0, 10);
  }

  const normalizedTime = String(timeValue).slice(0, 5);
  const date = new Date(`${normalizedDate}T${normalizedTime}:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
