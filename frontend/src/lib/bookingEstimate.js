const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * @param {string} timeStr
 * @returns {{ h: number; m: number; s: number } | null}
 */
export function parseTimeParts(timeStr) {
  if (typeof timeStr !== 'string' || !timeStr.trim()) return null;
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(timeStr.trim());
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = match[3] ? parseInt(match[3], 10) : 0;
  if (h > 23 || m > 59 || s > 59) return null;
  return { h, m, s };
}

/**
 * @param {unknown} input
 * @returns {{ y: number; mo: number; d: number } | null}
 */
export function getUtcDateParts(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return {
    y: d.getUTCFullYear(),
    mo: d.getUTCMonth(),
    d: d.getUTCDate(),
  };
}

/**
 * @param {{ y: number; mo: number; d: number }} parts
 * @param {string} timeStr
 * @returns {Date | null}
 */
export function utcDateTimeFromParts(parts, timeStr) {
  const t = parseTimeParts(timeStr);
  if (!t) return null;
  return new Date(Date.UTC(parts.y, parts.mo, parts.d, t.h, t.m, t.s));
}

/**
 * @param {Date} start
 * @param {Date} end
 * @returns {number | null}
 */
export function durationHours(start, end) {
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return null;
  return Math.round((ms / MS_PER_HOUR) * 100) / 100;
}

/**
 * @param {{ pricePerDay: number }} unit
 * @param {number} totalHours
 */
export function computeTotalPrice(unit, totalHours) {
  if (totalHours == null || !Number.isFinite(totalHours)) return null;
  const billedDays = Math.ceil(totalHours / 24);
  return Math.round(billedDays * unit.pricePerDay * 100) / 100;
}

/**
 * @param {string} startDate
 * @param {string} endDate
 * @param {string} startTime
 * @param {string} endTime
 * @param {{ pricePerDay: number } | null} unit
 */
export function estimateBookingTotal(startDate, endDate, startTime, endTime, unit) {
  if (!unit) return { totalHours: null, totalPrice: null };
  const sp = getUtcDateParts(startDate);
  const ep = getUtcDateParts(endDate);
  if (!sp || !ep) return { totalHours: null, totalPrice: null };
  const start = utcDateTimeFromParts(sp, startTime);
  const end = utcDateTimeFromParts(ep, endTime);
  if (!start || !end) return { totalHours: null, totalPrice: null };
  const totalHours = durationHours(start, end);
  if (totalHours == null) return { totalHours: null, totalPrice: null };
  return {
    totalHours,
    totalPrice: computeTotalPrice(unit, totalHours),
  };
}
