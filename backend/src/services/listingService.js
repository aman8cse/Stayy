import mongoose from 'mongoose';
import { Listing } from '../models/Listing.js';
import { Review } from '../models/Review.js';
import { Unit } from '../models/Unit.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const ROOM_PURPOSES = new Set(['sleep', 'study', 'freshen_up']);
const UNIT_TYPES = new Set(['room', 'bed', 'entire_place']);

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePage(value) {
  if (value === undefined || value === null || value === '') return DEFAULT_PAGE;
  const n = parseInt(String(value), 10);
  if (!Number.isInteger(n) || n < 1) {
    throw new AppError('page must be a positive integer', 400);
  }
  return n;
}

function parseLimit(value) {
  if (value === undefined || value === null || value === '') return DEFAULT_LIMIT;
  const n = parseInt(String(value), 10);
  if (!Number.isInteger(n) || n < 1) {
    throw new AppError('limit must be a positive integer', 400);
  }
  return Math.min(n, MAX_LIMIT);
}

/**
 * @param {Record<string, unknown>} q
 */
function parseSearchQuery(q) {
  const page = parsePage(q.page);
  const limit = parseLimit(q.limit);

  let minPrice;
  if (q.minPrice !== undefined && q.minPrice !== null && q.minPrice !== '') {
    const n = Number(q.minPrice);
    if (!Number.isFinite(n) || n < 0) {
      throw new AppError('minPrice must be a non-negative number', 400);
    }
    minPrice = n;
  }

  let maxPrice;
  if (q.maxPrice !== undefined && q.maxPrice !== null && q.maxPrice !== '') {
    const n = Number(q.maxPrice);
    if (!Number.isFinite(n) || n < 0) {
      throw new AppError('maxPrice must be a non-negative number', 400);
    }
    maxPrice = n;
  }

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new AppError('minPrice cannot be greater than maxPrice', 400);
  }

  let city;
  if (typeof q.city === 'string' && q.city.trim()) {
    city = q.city.trim();
    if (city.length > 120) {
      throw new AppError('city query is too long', 400);
    }
  }

  let roomPurpose;
  if (q.roomPurpose !== undefined && q.roomPurpose !== null && q.roomPurpose !== '') {
    if (typeof q.roomPurpose !== 'string' || !ROOM_PURPOSES.has(q.roomPurpose)) {
      throw new AppError('roomPurpose must be sleep, study, or freshen_up', 400);
    }
    roomPurpose = q.roomPurpose;
  }

  return { page, limit, city, roomPurpose, minPrice, maxPrice };
}

function requireString(value, field, { max = 5000, emptyMessage } = {}) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(emptyMessage || `${field} is required`, 400);
  }
  const t = value.trim();
  if (t.length > max) {
    throw new AppError(`${field} is too long`, 400);
  }
  return t;
}

function requireNumber(value, field, { min, max, integer = false } = {}) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) {
    throw new AppError(`${field} must be a number`, 400);
  }
  if (integer && !Number.isInteger(n)) {
    throw new AppError(`${field} must be an integer`, 400);
  }
  if (min !== undefined && n < min) {
    throw new AppError(`${field} is out of range`, 400);
  }
  if (max !== undefined && n > max) {
    throw new AppError(`${field} is out of range`, 400);
  }
  return n;
}

function parseCreatePayload(body) {
  const title = requireString(body?.title, 'title', { max: 200 });
  const description = requireString(body?.description, 'description', { max: 10000 });
  const city = requireString(body?.city, 'city', { max: 120 });
  const state = requireString(body?.state, 'state', { max: 120 });
  const country = requireString(body?.country, 'country', { max: 120 });

  const latitude = requireNumber(body?.latitude, 'latitude', { min: -90, max: 90 });
  const longitude = requireNumber(body?.longitude, 'longitude', { min: -180, max: 180 });

  const roomPurpose = body?.roomPurpose;
  if (typeof roomPurpose !== 'string' || !ROOM_PURPOSES.has(roomPurpose)) {
    throw new AppError('roomPurpose must be sleep, study, or freshen_up', 400);
  }

  const unitType = body?.unitType;
  if (typeof unitType !== 'string' || !UNIT_TYPES.has(unitType)) {
    throw new AppError('unitType must be room, bed, or entire_place', 400);
  }

  const pricePerHour = requireNumber(body?.pricePerHour, 'pricePerHour', { min: 0 });
  const pricePerDay = requireNumber(body?.pricePerDay, 'pricePerDay', { min: 0 });
  const capacity = requireNumber(body?.capacity, 'capacity', { min: 1, integer: true });

  return {
    listing: {
      title,
      description,
      city,
      state,
      country,
      latitude,
      longitude,
      roomPurpose,
    },
    unit: {
      unitType,
      pricePerHour,
      pricePerDay,
      capacity,
    },
  };
}

/**
 * Creates a listing and its first unit. Rolls back listing if unit creation fails.
 * @param {string} hostId
 * @param {Record<string, unknown>} body
 */
export async function createListingWithUnit(hostId, body) {
  if (!mongoose.Types.ObjectId.isValid(hostId)) {
    throw new AppError('Invalid host id', 400);
  }

  const { listing, unit } = parseCreatePayload(body);

  const listingDoc = await Listing.create({
    ...listing,
    host: hostId,
    isVerified: false,
  });

  try {
    const unitDoc = await Unit.create({
      ...unit,
      listing: listingDoc._id,
    });
    return { listing: listingDoc, unit: unitDoc };
  } catch (err) {
    await Listing.deleteOne({ _id: listingDoc._id });
    throw err;
  }
}

/**
 * Search listings with unit price filters, host projection, and pagination.
 * Uses a single aggregation with `$facet` so count and page share the same filter set.
 *
 * @param {Record<string, unknown>} query - req.query
 * @returns {Promise<{ listings: unknown[]; total: number; page: number; totalPages: number }>}
 */
export async function searchListings(query) {
  const { page, limit, city, roomPurpose, minPrice, maxPrice } = parseSearchQuery(query);
  const skip = (page - 1) * limit;

  const listingMatch = {};
  if (city) {
    listingMatch.city = { $regex: escapeRegex(city), $options: 'i' };
  }
  if (roomPurpose) {
    listingMatch.roomPurpose = roomPurpose;
  }

  const priceMatch = {};
  if (minPrice !== undefined) priceMatch.$gte = minPrice;
  if (maxPrice !== undefined) priceMatch.$lte = maxPrice;
  const hasPriceFilter = Object.keys(priceMatch).length > 0;

  const unitPipeline = [{ $match: { $expr: { $eq: ['$listing', '$$lid'] } } }];
  if (hasPriceFilter) {
    unitPipeline.push({ $match: { pricePerHour: priceMatch } });
  }

  const pipeline = [];

  if (Object.keys(listingMatch).length > 0) {
    pipeline.push({ $match: listingMatch });
  }

  pipeline.push({
    $lookup: {
      from: Unit.collection.name,
      let: { lid: '$_id' },
      pipeline: unitPipeline,
      as: 'units',
    },
  });

  if (hasPriceFilter) {
    pipeline.push({ $match: { 'units.0': { $exists: true } } });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        listings: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: User.collection.name,
              localField: 'host',
              foreignField: '_id',
              pipeline: [
                { $project: { name: 1, email: 1, phone: 1, role: 1, isVerified: 1 } },
              ],
              as: 'hostArr',
            },
          },
          { $set: { host: { $arrayElemAt: ['$hostArr', 0] } } },
          { $unset: ['hostArr'] },
          {
            $lookup: {
              from: Review.collection.name,
              localField: '_id',
              foreignField: 'listing',
              pipeline: [
                {
                  $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 },
                  },
                },
              ],
              as: 'reviewStats',
            },
          },
          {
            $addFields: {
              reviewCount: {
                $ifNull: [{ $arrayElemAt: ['$reviewStats.reviewCount', 0] }, 0],
              },
              averageRating: {
                $let: {
                  vars: { r: { $arrayElemAt: ['$reviewStats', 0] } },
                  in: {
                    $cond: [{ $ne: ['$$r', null] }, { $round: ['$$r.averageRating', 2] }, null],
                  },
                },
              },
            },
          },
          { $unset: 'reviewStats' },
        ],
        countArr: [{ $count: 'total' }],
      },
    }
  );

  const [facet] = await Listing.aggregate(pipeline);
  const listings = facet.listings;
  const total = facet.countArr[0]?.total ?? 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return { listings, total, page, totalPages };
}

/**
 * Single listing with all units, host projection, and review aggregates.
 * @param {string} listingId
 */
export async function findListingById(listingId) {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing id', 400);
  }

  const oid = new mongoose.Types.ObjectId(listingId);

  const pipeline = [
    { $match: { _id: oid } },
    {
      $lookup: {
        from: Unit.collection.name,
        localField: '_id',
        foreignField: 'listing',
        as: 'units',
      },
    },
    {
      $lookup: {
        from: User.collection.name,
        localField: 'host',
        foreignField: '_id',
        pipeline: [
          { $project: { name: 1, email: 1, phone: 1, role: 1, isVerified: 1 } },
        ],
        as: 'hostArr',
      },
    },
    { $set: { host: { $arrayElemAt: ['$hostArr', 0] } } },
    { $unset: ['hostArr'] },
    {
      $lookup: {
        from: Review.collection.name,
        localField: '_id',
        foreignField: 'listing',
        pipeline: [
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              reviewCount: { $sum: 1 },
            },
          },
        ],
        as: 'reviewStats',
      },
    },
    {
      $addFields: {
        reviewCount: {
          $ifNull: [{ $arrayElemAt: ['$reviewStats.reviewCount', 0] }, 0],
        },
        averageRating: {
          $let: {
            vars: { r: { $arrayElemAt: ['$reviewStats', 0] } },
            in: {
              $cond: [{ $ne: ['$$r', null] }, { $round: ['$$r.averageRating', 2] }, null],
            },
          },
        },
      },
    },
    { $unset: 'reviewStats' },
  ];

  const rows = await Listing.aggregate(pipeline);
  const listing = rows[0];
  if (!listing) {
    throw new AppError('Listing not found', 404);
  }
  return listing;
}
