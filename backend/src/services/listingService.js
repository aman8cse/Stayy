import mongoose from 'mongoose';
import { Listing } from '../models/Listing.js';
import { Review } from '../models/Review.js';
import { Unit } from '../models/Unit.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendListingCreatedEmail } from './emailService.js';

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

  return { page, limit, city, minPrice, maxPrice };
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

  const unitType = body?.unitType;
  if (typeof unitType !== 'string' || !UNIT_TYPES.has(unitType)) {
    throw new AppError('unitType must be room, bed, or entire_place', 400);
  }

  const pricePerDay = requireNumber(body?.pricePerDay, 'pricePerDay', { min: 0 });
  const capacity = requireNumber(body?.capacity, 'capacity', { min: 1, integer: true });
  const quantity = requireNumber(body?.quantity, 'quantity', { min: 1, integer: true });

  // Optional: Google Maps URL
  let googleMapsUrl = '';
  if (body?.googleMapsUrl && typeof body.googleMapsUrl === 'string' && body.googleMapsUrl.trim()) {
    const url = body.googleMapsUrl.trim();
    if (url.length <= 500) {
      googleMapsUrl = url;
    }
  }

  // Optional: Images
  let images = [];
  if (Array.isArray(body?.images) && body.images.length > 0) {
    images = body.images
      .filter((img) => img && typeof img === 'string' && img.trim())
      .slice(0, 10)
      .map((img, idx) => ({
        url: img.trim(),
        isThumbnail: idx === 0,
      }));
  }

  let thumbnail = images[0].url;

  // Optional: Amenities
  let amenities = [];
  if (Array.isArray(body?.amenities) && body.amenities.length > 0) {
    amenities = body.amenities
      .filter((a) => a && typeof a === 'string' && a.trim())
      .slice(0, 15)
      .map((a) => a.trim());
  }

  return {
    listing: {
      title,
      thumbnail,
      description,
      city,
      state,
      country,
      latitude,
      longitude,
      googleMapsUrl,
    },
    unit: {
      unitType,
      pricePerDay,
      capacity,
      quantity,
      images,
      amenities,
    },
  };
}

function parseOptionalNumber(value, field, { min, max, integer = false } = {}) {
  if (value === undefined) return undefined;
  return requireNumber(value, field, { min, max, integer });
}

function parseOptionalString(value, field, { max = 5000 } = {}) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new AppError(`${field} must be a string`, 400);
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new AppError(`${field} is too long`, 400);
  }
  return trimmed;
}

function parseUpdatePayload(body) {
  const listingUpdates = {};
  const unitUpdates = {};

  const title = parseOptionalString(body?.title, 'title', { max: 200 });
  if (title !== undefined && title !== '') listingUpdates.title = title;

  const description = parseOptionalString(body?.description, 'description', { max: 10000 });
  if (description !== undefined && description !== '') listingUpdates.description = description;

  const city = parseOptionalString(body?.city, 'city', { max: 120 });
  if (city !== undefined && city !== '') listingUpdates.city = city;

  const state = parseOptionalString(body?.state, 'state', { max: 120 });
  if (state !== undefined && state !== '') listingUpdates.state = state;

  const country = parseOptionalString(body?.country, 'country', { max: 120 });
  if (country !== undefined && country !== '') listingUpdates.country = country;

  const latitude = parseOptionalNumber(body?.latitude, 'latitude', { min: -90, max: 90 });
  if (latitude !== undefined) listingUpdates.latitude = latitude;

  const longitude = parseOptionalNumber(body?.longitude, 'longitude', { min: -180, max: 180 });
  if (longitude !== undefined) listingUpdates.longitude = longitude;

  if (body?.googleMapsUrl !== undefined) {
    if (typeof body.googleMapsUrl !== 'string') {
      throw new AppError('googleMapsUrl must be a string', 400);
    }
    const url = body.googleMapsUrl.trim();
    if (url.length > 500) {
      throw new AppError('googleMapsUrl is too long', 400);
    }
    listingUpdates.googleMapsUrl = url;
  }

  if (body?.unitType !== undefined) {
    if (typeof body.unitType !== 'string' || !UNIT_TYPES.has(body.unitType)) {
      throw new AppError('unitType must be room, bed, or entire_place', 400);
    }
    unitUpdates.unitType = body.unitType;
  }

  const pricePerDay = parseOptionalNumber(body?.pricePerDay, 'pricePerDay', { min: 0 });
  if (pricePerDay !== undefined) unitUpdates.pricePerDay = pricePerDay;

  const capacity = parseOptionalNumber(body?.capacity, 'capacity', { min: 1, integer: true });
  if (capacity !== undefined) unitUpdates.capacity = capacity;

  const quantity = parseOptionalNumber(body?.quantity, 'quantity', { min: 1, integer: true });
  if (quantity !== undefined) unitUpdates.quantity = quantity;

  if (body?.images !== undefined) {
    if (!Array.isArray(body.images)) {
      throw new AppError('images must be an array', 400);
    }
    unitUpdates.images = body.images
      .filter((img) => typeof img === 'string' && img.trim())
      .slice(0, 10)
      .map((img, idx) => ({
        url: img.trim(),
        isThumbnail: idx === 0,
      }));
  }

  if (body?.amenities !== undefined) {
    if (!Array.isArray(body.amenities)) {
      throw new AppError('amenities must be an array', 400);
    }
    unitUpdates.amenities = body.amenities
      .filter((amenity) => typeof amenity === 'string' && amenity.trim())
      .slice(0, 15)
      .map((amenity) => amenity.trim());
  }

  return { listingUpdates, unitUpdates };
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

    // Send email to host
    try {
      const host = await User.findById(hostId).select('name email');
      if (host) {
        await sendListingCreatedEmail(host.email, host.name, listing.title, listing.city);
      }
    } catch (err) {
      console.error('Failed to send listing created email:', err);
      // Don't fail listing creation if email fails
    }

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

  const priceMatch = {};
  if (minPrice !== undefined) priceMatch.$gte = minPrice;
  if (maxPrice !== undefined) priceMatch.$lte = maxPrice;
  const hasPriceFilter = Object.keys(priceMatch).length > 0;

  const unitPipeline = [{ $match: { $expr: { $eq: ['$listing', '$$lid'] } } }];
  if (hasPriceFilter) {
    unitPipeline.push({ $match: { pricePerDay: priceMatch } });
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

/**
 * Get all listings for a host
 * @param {string} hostId
 */
export async function getHostListings(hostId) {
  if (!mongoose.Types.ObjectId.isValid(hostId)) {
    throw new AppError('Invalid host id', 400);
  }

  const listings = await Listing.find({ host: hostId })
    .populate('host', 'name email phone role isVerified')
    .sort({ createdAt: -1 });

  // Add unit and review data for each listing
  for (const listing of listings) {
    const units = await Unit.find({ listing: listing._id });
    listing.units = units;
  }

  return listings;
}

/**
 * Update a listing (only host can update their own listing)
 * @param {string} listingId
 * @param {string} hostId
 * @param {Record<string, unknown>} updates
 */
export async function updateListing(listingId, hostId, updates) {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing id', 400);
  }
  if (!mongoose.Types.ObjectId.isValid(hostId)) {
    throw new AppError('Invalid host id', 400);
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Check authorization
  if (listing.host.toString() !== hostId) {
    throw new AppError('You can only update your own listings', 403);
  }

  const { listingUpdates, unitUpdates } = parseUpdatePayload(updates ?? {});

  Object.assign(listing, listingUpdates);

  await listing.save();

  if (Object.keys(unitUpdates).length > 0) {
    const unit = await Unit.findOne({ listing: listing._id }).sort({ createdAt: 1 });
    if (!unit) {
      throw new AppError('Unit not found for this listing', 404);
    }

    Object.assign(unit, unitUpdates);
    await unit.save();
  }

  return findListingById(listingId);
}

/**
 * Delete a listing and all its units (only host can delete their own listing)
 * @param {string} listingId
 * @param {string} hostId
 */
export async function deleteListing(listingId, hostId) {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing id', 400);
  }
  if (!mongoose.Types.ObjectId.isValid(hostId)) {
    throw new AppError('Invalid host id', 400);
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Check authorization
  if (listing.host.toString() !== hostId) {
    throw new AppError('You can only delete your own listings', 403);
  }

  // Delete all units associated with this listing
  await Unit.deleteMany({ listing: listingId });

  // Delete the listing
  await Listing.deleteOne({ _id: listingId });

  return { success: true };
}
