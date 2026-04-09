import * as adminService from '../services/adminService.js';

export async function getHosts(req, res) {
  const { search, isVerified, page, limit } = req.query;
  
  const options = {
    search,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
  };

  if (isVerified === 'true' || isVerified === 'false') {
    options.isVerified = isVerified === 'true';
  }

  const result = await adminService.getHosts(options);
  
  res.status(200).json({
    success: true,
    ...result,
  });
}

export async function getListings(req, res) {
  const { search, isVerified, page, limit } = req.query;
  
  const options = {
    search,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
  };

  if (isVerified === 'true' || isVerified === 'false') {
    options.isVerified = isVerified === 'true';
  }

  const result = await adminService.getListings(options);
  
  res.status(200).json({
    success: true,
    ...result,
  });
}

export async function verifyHost(req, res) {
  const { hostId } = req.params;
  const user = await adminService.verifyHost(hostId);
  res.status(200).json({
    success: true,
    message: 'Host verified successfully',
    user,
  });
}

export async function removeListingByAdmin(req, res) {
  const { listingId } = req.params;
  await adminService.removeListingByAdmin(listingId);
  res.status(200).json({
    success: true,
    message: 'Listing removed by admin',
  });
}

export async function verifyListing(req, res) {
  const { listingId } = req.params;
  const listing = await adminService.verifyListing(listingId);
  res.status(200).json({
    success: true,
    message: 'Listing verified successfully',
    listing,
  });
}
