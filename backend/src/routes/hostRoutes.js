import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import * as hostController from '../controllers/hostController.js';

const router = Router();

router.post('/become-host', authMiddleware, asyncHandler(hostController.becomeHost));

export default router;
