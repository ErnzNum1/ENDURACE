import Order from '../models/order.js';
import User from '../models/user.js';
import { sendPushNotification } from '../utils/pushNotification.js';
import { incrementUsage } from './discount.js';

const STATUS_LABELS = {
  PENDING:   'Pending',
  TO_SHIP:   'To Ship',
  DELIVERED: 'Delivered',
  CANCELED:  'Canceled',
};

const STATUS_MESSAGES = {
  TO_SHIP:   'Great news! Your order is on its way. 🚚',
  DELIVERED: 'Your order has been delivered. Enjoy! 🎉',
  CANCELED:  'Your order has been canceled.',
};

// ── CREATE order ──────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const {
      items, total, shippingAddress, paymentMethod,
      discountCode, discountAmount,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      total:           Number(total),
      shippingAddress: shippingAddress || {},
      paymentMethod:   paymentMethod || 'Cash on Delivery',
      status:          'PENDING',
      discountCode:    discountCode   || null,
      discountAmount:  discountAmount ? Number(discountAmount) : 0,
    });

    // Increment discount usage count
    if (discountCode) await incrementUsage(discountCode);

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET current user's orders ─────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET single order ──────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET all orders (admin) ────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE order status (admin) + push notification ───────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUS_LABELS[status]) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.notificationSentAt = new Date();
    await order.save();

    // Fetch the order owner's push token
    const owner = await User.findById(order.user).select('pushToken');
    if (owner?.pushToken) {
      const body = STATUS_MESSAGES[status] || `Status updated to: ${STATUS_LABELS[status]}`;

      // Pass owner._id so stale tokens can be removed automatically
      await sendPushNotification(
        owner.pushToken,
        `Order ${order._id.toString().slice(-6).toUpperCase()} — ${STATUS_LABELS[status]}`,
        body,
        { screen: 'OrderInfo', orderId: order._id.toString() },
        owner._id.toString()   // ← userId for stale-token cleanup
      );
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};