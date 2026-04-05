import { getApiBase } from '../lib/apiBase.js';

export async function signup(email, password, name, phone) {
  const base = getApiBase();
  const res = await fetch(`${base}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, phone }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export async function login(email, password) {
  const base = getApiBase();
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export async function listUserBookings(token) {
  const base = getApiBase();
  const res = await fetch(`${base}/bookings/user`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export async function becomeHost(token) {
  const base = getApiBase();
  const res = await fetch(`${base}/become-host`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({}),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export async function createReview(listingId, rating, comment, token) {
  const base = getApiBase();
  const res = await fetch(`${base}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ listingId, rating, comment }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export async function fetchReviews(listingId) {
  const base = getApiBase();
  const res = await fetch(`${base}/reviews/${encodeURIComponent(listingId)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}
