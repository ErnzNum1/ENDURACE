import express from 'express';
import { protect, adminOnly } from '../middlewares/auth.js';
import {
  getAllUsers, getUserById,
  setUserActiveStatus, setUserRole,
  getDashboardStats,
} from '../controllers/user.js';

const router = express.Router();

router.get('/stats',        protect, adminOnly, getDashboardStats);
router.get('/',             protect, adminOnly, getAllUsers);
router.get('/:id',          protect, adminOnly, getUserById);
router.put('/:id/status',   protect, adminOnly, setUserActiveStatus);
router.put('/:id/role',     protect, adminOnly, setUserRole);

export default router;