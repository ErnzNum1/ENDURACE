import User from '../models/user.js';
import {
  generateAccessToken, generateRefreshToken, verifyRefreshToken,
} from '../utils/token.js';
import { cloudinary } from '../middlewares/upload.js';

const sendTokens = async (user, res, statusCode = 200) => {
  const accessToken  = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken  = refreshToken;
  await user.save({ validateBeforeSave: false });
  const safeUser = {
    _id: user._id, firstName: user.firstName, lastName: user.lastName,
    email: user.email, avatar: user.avatar, role: user.role, authProvider: user.authProvider,
  };
  res.status(statusCode).json({ success: true, accessToken, refreshToken, user: safeUser });
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ firstName, lastName, email, password });
    await sendTokens(user, res, 201);
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // ── CRITICAL: explicitly select +password so bcrypt can compare ──
    const user = await User.findOne({ email }).select('+password');

    if (!user || user.authProvider !== 'local') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }
    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    await sendTokens(user, res);
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const decoded = verifyRefreshToken(token);
    const user    = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    await sendTokens(user, res);
  } catch (error) { res.status(401).json({ success: false, message: 'Invalid or expired refresh token' }); }
};

export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '', pushToken: '' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const googleAuth = async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, avatar } = req.body;
    if (!googleId || !email) {
      return res.status(400).json({ success: false, message: 'Google ID and email required' });
    }
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      if (!user.googleId) { user.googleId = googleId; user.authProvider = 'google'; }
      if (avatar && !user.avatar) user.avatar = avatar;
    } else {
      user = await User.create({ firstName, lastName, email, googleId, authProvider: 'google', avatar: avatar || '' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }
    await sendTokens(user, res);
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const facebookAuth = async (req, res) => {
  try {
    const { facebookId, email, firstName, lastName, avatar } = req.body;
    if (!facebookId || !email) {
      return res.status(400).json({ success: false, message: 'Facebook ID and email required' });
    }
    let user = await User.findOne({ $or: [{ facebookId }, { email }] });
    if (user) {
      if (!user.facebookId) { user.facebookId = facebookId; user.authProvider = 'facebook'; }
      if (avatar && !user.avatar) user.avatar = avatar;
    } else {
      user = await User.create({ firstName, lastName, email, facebookId, authProvider: 'facebook', avatar: avatar || '' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }
    await sendTokens(user, res);
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken -googleId -facebookId');
    res.status(200).json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (firstName) user.firstName = firstName;
    if (lastName)  user.lastName  = lastName;
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ success: false, message: 'Email already in use' });
      user.email = email;
    }

    if (req.file) {
      // Delete old avatar from Cloudinary
      if (user.avatar && user.avatar.includes('cloudinary.com')) {
        try {
          const parts    = user.avatar.split('/');
          const filename = parts[parts.length - 1].split('.')[0];
          await cloudinary.uploader.destroy(`endurace/avatars/${filename}`);
        } catch (_) {}
      }
      user.avatar = req.file.path;
    }

    await user.save();
    const safeUser = {
      _id: user._id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, avatar: user.avatar, role: user.role,
    };
    res.status(200).json({ success: true, user: safeUser });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const updatePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { pushToken: pushToken || '' });
    res.status(200).json({ success: true, message: 'Push token updated' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const deactivateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false, refreshToken: '', pushToken: '' });
    res.status(200).json({ success: true, message: 'Account deactivated' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};