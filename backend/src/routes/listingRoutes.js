import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import * as listingController from '../controllers/listingController.js';

const router = Router();

router.get('/listings', asyncHandler(listingController.list));
router.get('/listings/:listingId', asyncHandler(listingController.getById));

router.get(
  '/host/listings',
  authMiddleware,
  roleMiddleware('host'),
  asyncHandler(listingController.getHostListings)
);

router.post(
  '/listings',
  authMiddleware,
  roleMiddleware('host'),
  asyncHandler(listingController.create)
);

router.put(
  '/listings/:listingId',
  authMiddleware,
  roleMiddleware('host'),
  asyncHandler(listingController.updateListing)
);

router.delete(
  '/listings/:listingId',
  authMiddleware,
  roleMiddleware('host'),
  asyncHandler(listingController.deleteListing)
);

export default router;
