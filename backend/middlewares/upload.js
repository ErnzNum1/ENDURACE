import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── File filter — only allow images ──────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP images are allowed'), false);
  }
};

const LIMIT = { limits: { fileSize: 8 * 1024 * 1024 }, fileFilter };

// ── Product images ────────────────────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'endurace/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});
const upload = multer({ storage: productStorage, ...LIMIT });

// ── Avatar images ─────────────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'endurace/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});
export const uploadAvatar = multer({ storage: avatarStorage, ...LIMIT });

// ── Review images ─────────────────────────────────────────────────
const reviewStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'endurace/reviews',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 1000, crop: 'limit', quality: 'auto' }],
  },
});
export const uploadReview = multer({ storage: reviewStorage, ...LIMIT });

// ── Article images (featured + sections) ─────────────────────────
const articleStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'endurace/articles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});
export const uploadArticle = multer({ storage: articleStorage, ...LIMIT });

export { cloudinary };
export default upload;