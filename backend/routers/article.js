import express from 'express';
import { protect, adminOnly } from '../middlewares/auth.js';
import { uploadArticle } from '../middlewares/upload.js';
import {
  getArticles, getArticleById, getAllArticles,
  createArticle, updateArticle, deleteArticle,
  uploadSectionImage,
} from '../controllers/article.js';

const router = express.Router();

// Public
router.get('/',    getArticles);
router.get('/:id', getArticleById);

// Admin
router.get('/admin/all', protect, adminOnly, getAllArticles);

// Upload a single image (featured or section) — returns { url }
router.post(
  '/upload-image',
  protect,
  adminOnly,
  uploadArticle.single('image'),
  uploadSectionImage
);

router.post('/',   protect, adminOnly, uploadArticle.single('featuredImageFile'), createArticle);
router.put('/:id', protect, adminOnly, uploadArticle.single('featuredImageFile'), updateArticle);
router.delete('/:id', protect, adminOnly, deleteArticle);

export default router;