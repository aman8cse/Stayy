import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Listing } from '../models/Listing.js';
import { Review } from '../models/Review.js';
import { Unit } from '../models/Unit.js';
import { AppError } from '../utils/AppError.js';

/**
 * User must have at least one confirmed booking on any unit under this listing.
 * @param {string} userId
 * @param {string} listingId
 */
async function userHasBookingForListing(userId, listingId) {
  const unitIds = await Unit.find({ listing: listingId }).distinct('_id');
  if (!unitIds.length) {
    return false;
  }
  const exists = await Booking.exists({
    user: userId,
    unit: { $in: unitIds },
    status: 'confirmed',
  });
  return Boolean(exists);
}

function parseRating(value) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    throw new AppError('rating must be an integer from 1 to 5', 400);
  }
  return n;
}

function parseComment(value) {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value !== 'string') {
    throw new AppError('comment must be a string', 400);
  }
  return value.trim().slice(0, 2000);
}

/**
 * @param {string} userId
 * @param {{ listingId?: unknown; rating?: unknown; comment?: unknown }} body
 */
export async function createReview(userId, body) {
  const { listingId, rating, comment } = body ?? {};

  if (!listingId || typeof listingId !== 'string' || !mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Valid listingId is required', 400);
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  const eligible = await userHasBookingForListing(userId, listingId);
  if (!eligible) {
    throw new AppError('Only guests with a confirmed booking for this listing can leave a review', 403);
  }

  const r = parseRating(rating);
  const c = parseComment(comment);

  try {
    const review = await Review.create({
      user: userId,
      listing: listingId,
      rating: r,
      comment: c,
    });

    await review.populate('user', 'name isVerified');
    return review;
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('You have already reviewed this listing', 409);
    }
    throw err;
  }
}

/**
 * @param {string} listingId
 */
export async function getReviewsForListing(listingId) {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing id', 400);
  }

  const listingExists = await Listing.exists({ _id: listingId });
  if (!listingExists) {
    throw new AppError('Listing not found', 404);
  }

  const [stats, reviews] = await Promise.all([
    Review.aggregate([
      { $match: { listing: new mongoose.Types.ObjectId(listingId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]),
    Review.find({ listing: listingId })
      .sort({ createdAt: -1 })
      .populate('user', 'name isVerified')
      .lean(),
  ]);

  const row = stats[0];
  const averageRating =
    row && typeof row.averageRating === 'number'
      ? Math.round(row.averageRating * 100) / 100
      : null;
  const reviewCount = row?.reviewCount ?? 0;

  return {
    listingId,
    averageRating,
    reviewCount,
    reviews,
  };
}
