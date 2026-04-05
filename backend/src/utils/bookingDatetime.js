import { AppError } from './AppError.js';

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * @param {string} timeStr
 * @returns {{ h: number; m: number; s: number }}
 */
export function parseTimeParts(timeStr) {
  if (typeof timeStr !== 'string' || !timeStr.trim()) {
    throw new AppError('startTime and endTime are required', 400);
  }
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(timeStr.trim());
  if (!match) {
    throw new AppError('Time must be in HH:mm or HH:mm:ss format', 400);
  }
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = match[3] ? parseInt(match[3], 10) : 0;
  if (h > 23 || m > 59 || s > 59) {
    throw new AppError('Invalid time value', 400);
  }
  return { h, m, s };
}

/**
 * @param {unknown} input
 * @returns {{ y: number; mo: number; d: number }}
 */
export function getUtcDateParts(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    throw new AppError('Invalid date', 400);
  }
  return {
    y: d.getUTCFullYear(),
    mo: d.getUTCMonth(),
    d: d.getUTCDate(),
  };
}

/**
 * @param {{ y: number; mo: number; d: number }} parts
 * @param {string} timeStr
 */
export function utcDateTimeFromParts(parts, timeStr) {
  const { h, m, s } = parseTimeParts(timeStr);
  return new Date(Date.UTC(parts.y, parts.mo, parts.d, h, m, s));
}

/**
 * Calendar date at UTC midnight (for persisting startDate / endDate).
 * @param {{ y: number; mo: number; d: number }} parts
 */
export function utcMidnightFromParts(parts) {
  return new Date(Date.UTC(parts.y, parts.mo, parts.d, 0, 0, 0, 0));
}

/**
 * @param {string} timeStr
 */
export function normalizeTimeString(timeStr) {
  const { h, m, s } = parseTimeParts(timeStr);
  const pad = (n) => String(n).padStart(2, '0');
  return s ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}`;
}

/**
 * Absolute start/end instants for overlap checks.
 * @param {{ startDate: Date; endDate: Date; startTime: string; endTime: string }} doc
 */
export function bookingWindow(doc) {
  const startParts = getUtcDateParts(doc.startDate);
  const endParts = getUtcDateParts(doc.endDate);
  return {
    start: utcDateTimeFromParts(startParts, doc.startTime),
    end: utcDateTimeFromParts(endParts, doc.endTime),
  };
}

/**
 * @param {Date} start
 * @param {Date} end
 */
export function durationHours(start, end) {
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) {
    throw new AppError('end must be after start', 400);
  }
  return Math.round((ms / MS_PER_HOUR) * 100) / 100;
}

export { MS_PER_HOUR };
