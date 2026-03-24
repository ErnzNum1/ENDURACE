import express from 'express';
import { protect, adminOnly } from '../middlewares/auth.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.js';

const router = express.Router();

// User routes
router.post('/',        protect, createOrder);
router.get('/my',       protect, getMyOrders);
router.get('/:id',      protect, getOrderById);

// Admin routes
router.get('/',          protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;