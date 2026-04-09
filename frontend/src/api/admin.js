import { getApiBase } from '../lib/apiBase.js';
import { getStoredToken } from '../lib/authStorage.js';

async function makeAdminRequest(method, endpoint, body = null) {
  const base = getApiBase();
  const token = getStoredToken();

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${base}/admin${endpoint}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export async function getHosts(search = '', isVerified = null, page = 1, limit = 10) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (isVerified !== null) params.append('isVerified', String(isVerified));
  params.append('page', String(page));
  params.append('limit', String(limit));

  const base = getApiBase();
  const token = getStoredToken();

  const res = await fetch(`${base}/admin/hosts?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export async function getListings(search = '', isVerified = null, page = 1, limit = 10) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (isVerified !== null) params.append('isVerified', String(isVerified));
  params.append('page', String(page));
  params.append('limit', String(limit));

  const base = getApiBase();
  const token = getStoredToken();

  const res = await fetch(`${base}/admin/listings?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export async function verifyHost(hostId) {
  return makeAdminRequest('POST', `/verify-host/${hostId}`);
}

export async function verifyListing(listingId) {
  return makeAdminRequest('POST', `/verify-listing/${listingId}`);
}

export async function removeListingByAdmin(listingId) {
  return makeAdminRequest('DELETE', `/listings/${listingId}`);
}
