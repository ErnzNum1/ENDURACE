import Review    from '../models/review.js';
import Order     from '../models/order.js';
import mongoose  from 'mongoose';
import { cloudinary } from '../middlewares/upload.js';
import { filterBadWords } from '../utils/badWords.js';

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name images category price')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const canReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    const eligibleOrder = await findEligibleOrder(userId, productId);
    if (!eligibleOrder) {
      return res.status(200).json({ success: true, canReview: false, reason: 'No delivered order found' });
    }
    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) {
      return res.status(200).json({ success: true, canReview: false, reason: 'Already reviewed', existingReview: existing });
    }
    res.status(200).json({ success: true, canReview: true, orderId: eligibleOrder._id });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const findEligibleOrder = async (userId, productId) => {
  try {
    const productObjectId = new mongoose.Types.ObjectId(productId);
    const order = await Order.findOne({ user: userId, status: 'DELIVERED', 'items.product': productObjectId });
    if (order) return order;
  } catch (_) {}
  const deliveredOrders = await Order.find({ user: userId, status: 'DELIVERED' });
  for (const o of deliveredOrders) {
    const found = o.items.some((item) => item.product?.toString() === productId.toString());
    if (found) return o;
  }
  return null;
};

export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user._id;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'productId, rating, and comment are required' });
    }

    // Filter bad words instead of blocking
    const filteredComment = filterBadWords(comment.trim());

    let eligibleOrder = null;
    if (orderId) {
      try {
        eligibleOrder = await Order.findOne({ _id: orderId, user: userId, status: 'DELIVERED' });
        if (eligibleOrder) {
          const hasProduct = eligibleOrder.items.some((item) => item.product?.toString() === productId.toString());
          if (!hasProduct) eligibleOrder = null;
        }
      } catch (_) {}
    }
    if (!eligibleOrder) eligibleOrder = await findEligibleOrder(userId, productId);
    if (!eligibleOrder) {
      return res.status(403).json({ success: false, message: 'You can only review products from your delivered orders' });
    }

    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
    }

    const images = req.files ? req.files.map((f) => f.path) : [];
    const review = await Review.create({
      product: productId, user: userId, order: eligibleOrder._id,
      rating: Number(rating), comment: filteredComment, images,
    });
    await review.populate('user', 'firstName lastName avatar');
    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Already reviewed' });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (rating  !== undefined) review.rating  = Number(rating);
    if (comment !== undefined) review.comment = filterBadWords(comment.trim());
    if (req.files?.length > 0) review.images = [...(review.images || []), ...req.files.map((f) => f.path)];
    if (req.body.removeImages) {
      const toRemove = Array.isArray(req.body.removeImages) ? req.body.removeImages : [req.body.removeImages];
      for (const url of toRemove) {
        const parts = url.split('/');
        await cloudinary.uploader.destroy(`endurace/reviews/${parts[parts.length - 1].split('.')[0]}`).catch(() => {});
      }
      review.images = review.images.filter((img) => !toRemove.includes(img));
    }
    await review.save();
    await review.populate('user', 'firstName lastName avatar');
    res.status(200).json({ success: true, review });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    for (const url of review.images || []) {
      const parts = url.split('/');
      await cloudinary.uploader.destroy(`endurace/reviews/${parts[parts.length - 1].split('.')[0]}`).catch(() => {});
    }
    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};