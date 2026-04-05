import { getApiBase } from '../lib/apiBase.js';

/**
 * @param {Record<string, string | number | undefined>} params
 */
export async function fetchListings(params) {
  const base = getApiBase();
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });

  const url = `${base}/listings?${search.toString()}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

/**
 * @param {string} listingId
 */
export async function fetchListingById(listingId) {
  const base = getApiBase();
  const res = await fetch(`${base}/listings/${encodeURIComponent(listingId)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

/**
 * @param {object} body - flat listing + unit payload
 * @param {string | null} token - Bearer JWT (host)
 */
export async function createListing(body, token) {
  const base = getApiBase();
  const res = await fetch(`${base}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}
