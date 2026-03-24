import express from 'express';
import upload from '../middlewares/upload.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import {
  getProducts, getProductById,
  createProduct, updateProduct, deleteProduct,
} from '../controllers/product.js';

const router = express.Router();

// Public
router.get('/',    getProducts);
router.get('/:id', getProductById);

// Admin only
router.post('/',   protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;