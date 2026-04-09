import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import hostRoutes from './hostRoutes.js';
import listingRoutes from './listingRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use(hostRoutes);
router.use(listingRoutes);
router.use(bookingRoutes);
router.use(reviewRoutes);
router.use('/admin', adminRoutes);

export default router;
