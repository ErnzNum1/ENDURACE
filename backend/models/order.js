import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:      { type: String, required: true },
    variation: { type: String, default: '' },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true, min: 1 },
    image:     { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },

    // Discount applied at checkout
    discountCode:   { type: String,  default: null },
    discountAmount: { type: Number,  default: 0 },

    status: {
      type: String,
      enum: ['PENDING', 'TO_SHIP', 'DELIVERED', 'CANCELED'],
      default: 'PENDING',
    },
    shippingAddress: {
      fullName: { type: String, default: '' },
      address:  { type: String, default: '' },
      city:     { type: String, default: '' },
      province: { type: String, default: '' },
      zipCode:  { type: String, default: '' },
      phone:    { type: String, default: '' },
    },
    paymentMethod:      { type: String, default: 'Cash on Delivery' },
    notificationSentAt: { type: Date,   default: null },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;