import express from 'express';
import { protect, adminOnly } from '../middlewares/auth.js';
import {
  getAllDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  validateDiscount,
} from '../controllers/discount.js';

const router = express.Router();

// Public — any authenticated user can validate a code at checkout
router.post('/validate', protect, validateDiscount);

// Admin only
router.get('/',      protect, adminOnly, getAllDiscounts);
router.post('/',     protect, adminOnly, createDiscount);
router.put('/:id',   protect, adminOnly, updateDiscount);
router.delete('/:id',protect, adminOnly, deleteDiscount);

export default router;