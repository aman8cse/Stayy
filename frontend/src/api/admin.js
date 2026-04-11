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

async function makeAdminGetRequest(endpoint, params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }
    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return makeAdminRequest('GET', `${endpoint}${query ? `?${query}` : ''}`);
}

export async function getHosts(search = '', isVerified = null, page = 1, limit = 10) {
  return makeAdminGetRequest('/hosts', {
    search,
    isVerified,
    page,
    limit,
  });
}

export async function getListings(search = '', isVerified = null, page = 1, limit = 10) {
  return makeAdminGetRequest('/listings', {
    search,
    isVerified,
    page,
    limit,
  });
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
