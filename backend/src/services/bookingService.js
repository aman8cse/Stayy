import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Unit } from '../models/Unit.js';
import { AppError } from '../utils/AppError.js';
import {
  bookingWindow,
  durationHours,
  getUtcDateParts,
  normalizeTimeString,
  utcMidnightFromParts,
  utcDateTimeFromParts,
} from '../utils/bookingDatetime.js';

const ACTIVE_STATUSES = ['pending', 'confirmed'];

function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return !(aEnd <= bStart || aStart >= bEnd);
}

/**
 * @param {string} unitId
 * @param {Date} newStart
 * @param {Date} newEnd
 */
async function hasConflictingBooking(unitId, newStart, newEnd) {
  const candidates = await Booking.find({
    unit: unitId,
    status: { $in: ACTIVE_STATUSES },
  }).lean();

  for (const b of candidates) {
    const { start, end } = bookingWindow(b);
    if (intervalsOverlap(newStart, newEnd, start, end)) {
      return true;
    }
  }
  return false;
}

/**
 * @param {{ pricePerHour: number; pricePerDay: number }} unit
 * @param {number} totalHours
 */
function computeTotalPrice(unit, totalHours) {
  if (totalHours < 24) {
    return Math.round(totalHours * unit.pricePerHour * 100) / 100;
  }
  const billedDays = Math.ceil(totalHours / 24);
  return Math.round(billedDays * unit.pricePerDay * 100) / 100;
}

/**
 * @param {string} userId
 * @param {{ unitId?: unknown; startDate?: unknown; endDate?: unknown; startTime?: unknown; endTime?: unknown }} body
 */
export async function createBooking(userId, body) {
  const { unitId, startDate, endDate, startTime, endTime } = body ?? {};

  if (!unitId || typeof unitId !== 'string' || !mongoose.Types.ObjectId.isValid(unitId)) {
    throw new AppError('Valid unitId is required', 400);
  }

  if (startDate === undefined || startDate === null || startDate === '') {
    throw new AppError('startDate is required', 400);
  }
  if (endDate === undefined || endDate === null || endDate === '') {
    throw new AppError('endDate is required', 400);
  }

  const unit = await Unit.findById(unitId);
  if (!unit) {
    throw new AppError('Unit not found', 404);
  }

  const startParts = getUtcDateParts(startDate);
  const endParts = getUtcDateParts(endDate);
  const newStart = utcDateTimeFromParts(startParts, String(startTime ?? ''));
  const newEnd = utcDateTimeFromParts(endParts, String(endTime ?? ''));

  const totalHours = durationHours(newStart, newEnd);
  const totalPrice = computeTotalPrice(unit, totalHours);

  if (await hasConflictingBooking(unitId, newStart, newEnd)) {
    throw new AppError('This unit is already booked for part of the selected time range', 409);
  }

  const booking = await Booking.create({
    user: userId,
    unit: unitId,
    startDate: utcMidnightFromParts(startParts),
    endDate: utcMidnightFromParts(endParts),
    startTime: normalizeTimeString(String(startTime)),
    endTime: normalizeTimeString(String(endTime)),
    totalHours,
    totalPrice,
    status: 'confirmed',
  });

  await booking.populate({
    path: 'unit',
    populate: { path: 'listing', select: 'title city state country isVerified roomPurpose' },
  });

  return booking;
}

/**
 * @param {string} userId
 */
export async function listBookingsForUser(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user id', 400);
  }

  return Booking.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'unit',
      populate: { path: 'listing', select: 'title city state country roomPurpose isVerified' },
    })
    .lean();
}
