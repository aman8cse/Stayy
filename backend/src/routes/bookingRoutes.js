import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import * as bookingController from '../controllers/bookingController.js';

const router = Router();

router.post('/bookings', authMiddleware, asyncHandler(bookingController.create));
router.get('/bookings/user', authMiddleware, asyncHandler(bookingController.listForUser));

export default router;
