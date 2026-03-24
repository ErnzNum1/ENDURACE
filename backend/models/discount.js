import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Discount code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['PERCENTAGE', 'FLAT'],
      required: true,
    },
    // PERCENTAGE: 0–100  |  FLAT: fixed peso amount off
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    // Optional minimum order total before code can be applied
    minimumOrder: {
      type: Number,
      default: 0,
    },
    // How many times this code can be used in total (null = unlimited)
    usageLimit: {
      type: Number,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual: is the code still valid?
discountSchema.virtual('isValid').get(function () {
  if (!this.isActive) return false;
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
});

discountSchema.set('toJSON', { virtuals: true });

const Discount = mongoose.model('Discount', discountSchema);
export default Discount;