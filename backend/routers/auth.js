import express from 'express';
import { protect } from '../middlewares/auth.js';
import { uploadAvatar } from '../middlewares/upload.js';
import {
  register, login, refreshToken, logout,
  googleAuth, facebookAuth,
  getProfile, updateProfile,
  updatePushToken, deactivateAccount,
} from '../controllers/auth.js';

const router = express.Router();

// Public
router.post('/register',     register);
router.post('/login',        login);
router.post('/refresh',      refreshToken);
router.post('/oauth/google', googleAuth);
router.post('/oauth/facebook', facebookAuth);

// Protected
router.post('/logout',     protect, logout);
router.get('/profile',     protect, getProfile);
router.put('/profile',     protect, uploadAvatar.single('avatar'), updateProfile);
router.put('/push-token',  protect, updatePushToken);
router.delete('/deactivate', protect, deactivateAccount);

export default router;