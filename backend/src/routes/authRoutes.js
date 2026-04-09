import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/signup', asyncHandler(authController.signup));
router.post('/login', asyncHandler(authController.login));
router.post('/verify-otp', asyncHandler(authController.verifyOTP));
router.post('/resend-otp', asyncHandler(authController.resendOTP));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));

export default router;
