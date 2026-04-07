const UNIT_TYPES = new Set(['room', 'bed', 'entire_place']);

function reqStr(value, field, max) {
  const s = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
  if (!s) return { ok: false, message: `${field} is required` };
  if (s.length > max) return { ok: false, message: `${field} must be at most ${max} characters` };
  return { ok: true, value: s };
}

function reqNumber(value, field, { min, max, integer = false } = {}) {
  if (value === '' || value === null || value === undefined) {
    return { ok: false, message: `${field} is required` };
  }
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return { ok: false, message: `${field} must be a valid number` };
  if (integer && !Number.isInteger(n)) return { ok: false, message: `${field} must be a whole number` };
  if (min !== undefined && n < min) return { ok: false, message: `${field} is out of range` };
  if (max !== undefined && n > max) return { ok: false, message: `${field} is out of range` };
  return { ok: true, value: n };
}

/**
 * @param {Record<string, unknown>} raw
 * @returns {{ ok: boolean; errors: Record<string, string>; payload?: object }}
 */
export function validateListingForm(raw) {
  /** @type {Record<string, string>} */
  const errors = {};

  const title = reqStr(raw.title, 'Title', 200);
  if (!title.ok) errors.title = title.message;

  const description = reqStr(raw.description, 'Description', 10000);
  if (!description.ok) errors.description = description.message;

  const city = reqStr(raw.city, 'City', 120);
  if (!city.ok) errors.city = city.message;

  const state = reqStr(raw.state, 'State', 120);
  if (!state.ok) errors.state = state.message;

  const country = reqStr(raw.country, 'Country', 120);
  if (!country.ok) errors.country = country.message;

  const latitude = reqNumber(raw.latitude, 'Latitude', { min: -90, max: 90 });
  if (!latitude.ok) errors.latitude = latitude.message;

  const longitude = reqNumber(raw.longitude, 'Longitude', { min: -180, max: 180 });
  if (!longitude.ok) errors.longitude = longitude.message;

  const ut = raw.unitType;
  if (typeof ut !== 'string' || !UNIT_TYPES.has(ut)) {
    errors.unitType = 'Choose a valid unit type';
  }

  const pricePerDay = reqNumber(raw.pricePerDay, 'Price per day', { min: 0 });
  if (!pricePerDay.ok) errors.pricePerDay = pricePerDay.message;

  const capacity = reqNumber(raw.capacity, 'Capacity', { min: 1, integer: true });
  if (!capacity.ok) errors.capacity = capacity.message;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    errors: {},
    payload: {
      title: title.value,
      description: description.value,
      city: city.value,
      state: state.value,
      country: country.value,
      latitude: latitude.value,
      longitude: longitude.value,
      unitType: ut,
      pricePerDay: pricePerDay.value,
      capacity: capacity.value,
    },
  };
}
