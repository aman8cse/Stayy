import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import * as bookingController from '../controllers/bookingController.js';

const router = Router();

router.post('/bookings', authMiddleware, asyncHandler(bookingController.create));
router.get('/bookings/user', authMiddleware, asyncHandler(bookingController.listForUser));
router.get('/bookings/host', authMiddleware, roleMiddleware("host"), asyncHandler(bookingController.listForHost));
router.post('/bookings/:bookingId/cancel', authMiddleware, asyncHandler(bookingController.cancel));

export default router;
