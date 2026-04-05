import { getApiBase } from '../lib/apiBase.js';

export class BookingConflictError extends Error {
  constructor() {
    super('ALREADY_BOOKED');
    this.name = 'BookingConflictError';
  }
}

export async function createBooking(body, token) {
  const base = getApiBase();
  const res = await fetch(`${base}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 409) {
    throw new BookingConflictError();
  }

  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}
