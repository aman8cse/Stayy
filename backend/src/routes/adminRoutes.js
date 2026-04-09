import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, roleMiddleware('admin'));

// Get list of hosts with search and filtering
router.get('/hosts', asyncHandler(adminController.getHosts));

// Get list of listings with search and filtering
router.get('/listings', asyncHandler(adminController.getListings));

// Verify a host
router.post('/verify-host/:hostId', asyncHandler(adminController.verifyHost));

// Verify a listing
router.post('/verify-listing/:listingId', asyncHandler(adminController.verifyListing));

// Remove a listing
router.delete('/listings/:listingId', asyncHandler(adminController.removeListingByAdmin));

export default router;
