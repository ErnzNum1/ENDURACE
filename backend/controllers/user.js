import User    from '../models/user.js';
import Order   from '../models/order.js';
import Product from '../models/product.js';
import Article from '../models/article.js';

// ── Admin: GET all users ──────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ── Admin: GET single user ────────────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ── Admin: ACTIVATE / DEACTIVATE user ────────────────────────────
export const setUserActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) {
      return res.status(400).json({ success: false, message: 'isActive is required' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own active status' });
    }

    user.isActive = Boolean(isActive);
    if (!user.isActive) {
      user.refreshToken = '';
      user.pushToken    = '';
    }
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, role: user.role, isActive: user.isActive,
      },
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ── Admin: SET user role (user / admin) ───────────────────────────
export const setUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'user' or 'admin'" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User role updated to '${role}'`,
      user: {
        _id: user._id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, role: user.role, isActive: user.isActive,
      },
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ── Admin: GET dashboard stats ────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, totalArticles, recentOrders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Article.countDocuments({ isActive: true }),
      Order.find().sort({ createdAt: -1 }).limit(5)
        .populate('user', 'firstName lastName email'),
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const revenue = await Order.aggregate([
      { $match: { status: { $in: ['DELIVERED', 'TO_SHIP'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalArticles,
        totalRevenue: revenue[0]?.total || 0,
        ordersByStatus: ordersByStatus.reduce((acc, s) => {
          acc[s._id] = s.count; return acc;
        }, {}),
        recentOrders,
      },
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};