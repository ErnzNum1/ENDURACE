import Discount from '../models/discount.js';

// ── Admin: GET all discounts ───────────────────────────────────────
export const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, discounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: CREATE discount ────────────────────────────────────────
export const createDiscount = async (req, res) => {
  try {
    const { code, description, type, value, minimumOrder, usageLimit, expiresAt } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({ success: false, message: 'code, type, and value are required' });
    }

    const discount = await Discount.create({
      code: code.toUpperCase().trim(),
      description,
      type,
      value: Number(value),
      minimumOrder: Number(minimumOrder) || 0,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      expiresAt: expiresAt || null,
    });

    res.status(201).json({ success: true, discount });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Discount code already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: UPDATE discount ────────────────────────────────────────
export const updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return res.status(404).json({ success: false, message: 'Discount not found' });

    const fields = ['description', 'type', 'value', 'minimumOrder', 'usageLimit', 'expiresAt', 'isActive'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) discount[f] = req.body[f];
    });

    await discount.save();
    res.status(200).json({ success: true, discount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: DELETE discount ────────────────────────────────────────
export const deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return res.status(404).json({ success: false, message: 'Discount not found' });
    await discount.deleteOne();
    res.status(200).json({ success: true, message: 'Discount deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUBLIC: Validate a discount code ─────────────────────────────
// Used by the mobile cart before placing an order.
// Returns the discount details if valid; error if not.
export const validateDiscount = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

    const discount = await Discount.findOne({ code: code.toUpperCase().trim() });

    if (!discount) {
      return res.status(404).json({ success: false, message: 'Invalid discount code' });
    }
    if (!discount.isActive) {
      return res.status(400).json({ success: false, message: 'This code is no longer active' });
    }
    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return res.status(400).json({ success: false, message: 'This code has expired' });
    }
    if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
      return res.status(400).json({ success: false, message: 'This code has reached its usage limit' });
    }
    if (orderTotal !== undefined && Number(orderTotal) < discount.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of Php. ${discount.minimumOrder.toLocaleString()} required`,
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = Math.round((Number(orderTotal) * discount.value) / 100);
    } else {
      discountAmount = Math.min(discount.value, Number(orderTotal));
    }

    res.status(200).json({
      success: true,
      discount: {
        _id:            discount._id,
        code:           discount.code,
        description:    discount.description,
        type:           discount.type,
        value:          discount.value,
        discountAmount,
        finalTotal:     Math.max(0, Number(orderTotal) - discountAmount),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Internal: increment usage after order placed ──────────────────
export const incrementUsage = async (code) => {
  if (!code) return;
  await Discount.findOneAndUpdate(
    { code: code.toUpperCase().trim() },
    { $inc: { usageCount: 1 } }
  ).catch(() => {});
};