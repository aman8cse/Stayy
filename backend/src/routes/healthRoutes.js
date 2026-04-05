import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as healthController from '../controllers/healthController.js';

const router = Router();

router.get('/health', asyncHandler(healthController.getHealth));

export default router;
