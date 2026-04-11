import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Unit } from '../models/Unit.js';
import { AppError } from '../utils/AppError.js';
import { toPublicUser } from '../utils/userPublic.js';

/**
 * Gets all hosts with optional filtering
 * @param {Object} options
 * @param {string} options.search - search by name or email
 * @param {boolean} options.isVerified - filter by verified status
 * @param {number} options.page - page number
 * @param {number} options.limit - items per page
 */
export async function getHosts(options = {}) {
  const search = options.search || '';
  const isVerified = options.isVerified;
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 10));

  const query = { role: 'host' };

  // Search by name or email
  if (search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  // Filter by verified status
  if (typeof isVerified === 'boolean') {
    query.isVerified = isVerified;
  }

  const baseQuery = { role: 'host' };
  const [total, overallTotal, overallVerified, hosts] = await Promise.all([
    User.countDocuments(query),
    User.countDocuments(baseQuery),
    User.countDocuments({ ...baseQuery, isVerified: true }),
    User.find(query)
      .select('_id name email phone role isVerified createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
  ]);

  return {
    hosts: hosts.map(toPublicUser),
    summary: {
      total: overallTotal,
      verified: overallVerified,
      unverified: Math.max(overallTotal - overallVerified, 0),
    },
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Gets all listings with optional filtering and search
 * @param {Object} options
 * @param {string} options.search - search by title or city
 * @param {boolean} options.isVerified - filter by verified status
 * @param {number} options.page - page number
 * @param {number} options.limit - items per page
 */
export async function getListings(options = {}) {
  const search = options.search || '';
  const isVerified = options.isVerified;
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 10));

  const query = {};

  // Search by title or city
  if (search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ title: searchRegex }, { city: searchRegex }];
  }

  // Filter by verified status
  if (typeof isVerified === 'boolean') {
    query.isVerified = isVerified;
  }

  const [total, overallTotal, overallVerified, listings] = await Promise.all([
    Listing.countDocuments(query),
    Listing.countDocuments({}),
    Listing.countDocuments({ isVerified: true }),
    Listing.find(query)
      .populate('host', '_id name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
  ]);

  return {
    listings: listings.map((listing) => ({
      id: listing._id.toString(),
      title: listing.title,
      city: listing.city,
      state: listing.state,
      country: listing.country,
      host: listing.host ? {
        id: listing.host._id.toString(),
        name: listing.host.name,
        email: listing.host.email,
      } : null,
      isVerified: listing.isVerified,
      createdAt: listing.createdAt,
    })),
    summary: {
      total: overallTotal,
      verified: overallVerified,
      unverified: Math.max(overallTotal - overallVerified, 0),
    },
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Verifies a host by updating their isVerified status
 * @param {string} hostId
 */
export async function verifyHost(hostId) {
  if (!mongoose.Types.ObjectId.isValid(hostId)) {
    throw new AppError('Invalid host id', 400);
  }

  const user = await User.findById(hostId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role !== 'host') {
    throw new AppError('Only hosts can be verified', 400);
  }

  user.isVerified = true;
  await user.save();

  return toPublicUser(user);
}

/**
 * Removes a listing as admin (no authorization checks)
 * @param {string} listingId
 */
export async function removeListingByAdmin(listingId) {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing id', 400);
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  // Delete all units associated with this listing
  await Unit.deleteMany({ listing: listingId });

  // Delete the listing
  await Listing.deleteOne({ _id: listingId });
}

/**
 * Verifies a listing by updating its isVerified status
 * @param {string} listingId
 */
export async function verifyListing(listingId) {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing id', 400);
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404);
  }

  listing.isVerified = true;
  await listing.save();

  return {
    id: listing._id.toString(),
    title: listing.title,
    city: listing.city,
    isVerified: listing.isVerified,
  };
}
