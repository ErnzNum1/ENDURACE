import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName:    { type: String, required: [true, 'First name is required'], trim: true },
    lastName:     { type: String, required: [true, 'Last name is required'],  trim: true },
    email:        { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    // select: false ensures password is NEVER returned in queries unless explicitly requested with +password
    password:     { type: String, minlength: [6, 'Password must be at least 6 characters'], select: false },
    avatar:       { type: String, default: '' },
    role:         { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive:     { type: Boolean, default: true },
    authProvider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
    googleId:     { type: String, default: '' },
    facebookId:   { type: String, default: '' },
    pushToken:    { type: String, default: '' },
    // select: false so token is never accidentally leaked in API responses
    refreshToken: { type: String, default: '', select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;