import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import * as reviewController from '../controllers/reviewController.js';

const router = Router();

router.post('/reviews', authMiddleware, asyncHandler(reviewController.create));
router.get('/reviews/:listingId', asyncHandler(reviewController.listByListing));

export default router;
