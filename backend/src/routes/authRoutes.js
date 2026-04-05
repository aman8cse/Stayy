import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/signup', asyncHandler(authController.signup));
router.post('/login', asyncHandler(authController.login));

export default router;
