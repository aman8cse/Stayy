import * as listingService from '../services/listingService.js';

export async function create(req, res) {
  const { listing, unit } = await listingService.createListingWithUnit(req.user.id, req.body);
  res.status(201).json({
    success: true,
    listing,
    unit,
  });
}

export async function list(req, res) {
  const { listings, total, page, totalPages } = await listingService.searchListings(req.query);
  res.status(200).json({
    success: true,
    listings,
    total,
    page,
    totalPages,
  });
}

export async function getById(req, res) {
  const listing = await listingService.findListingById(req.params.listingId);
  res.status(200).json({
    success: true,
    listing,
  });
}
