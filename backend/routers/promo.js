import express from 'express';
import { protect, adminOnly } from '../middlewares/auth.js';
import { broadcastPromotion } from '../controllers/promo.js';

const router = express.Router();

// Admin only — broadcast a promotion push notification
router.post('/broadcast', protect, adminOnly, broadcastPromotion);

export default router;