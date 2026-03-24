import express    from 'express';
import mongoose   from 'mongoose';
import dotenv     from 'dotenv';
import cookieParser from 'cookie-parser';

import authRouter     from './routers/auth.js';
import productRouter  from './routers/product.js';
import reviewRouter   from './routers/review.js';
import orderRouter    from './routers/order.js';
import discountRouter from './routers/discount.js';
import promoRouter    from './routers/promo.js';
import articleRouter  from './routers/article.js';
import userRouter     from './routers/user.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:3000',
  'https://endurace-backend.onrender.com',
  // Expo web dev server wildcard
];

app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  // Allow all origins that are in the list, plus any Expo/ngrok tunnel URLs
  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith('.ngrok.io') ||
    origin.endsWith('.ngrok-free.app') ||
    origin.endsWith('.exp.direct') ||
    !origin; // native mobile apps send no origin header

  res.header('Access-Control-Allow-Origin',      isAllowed ? origin : ALLOWED_ORIGINS[0]);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods',     'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers',     'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  res.header('Access-Control-Max-Age',           '86400');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ── Body parsers ──────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',      authRouter);
app.use('/api/products',  productRouter);
app.use('/api/reviews',   reviewRouter);
app.use('/api/orders',    orderRouter);
app.use('/api/discounts', discountRouter);
app.use('/api/promo',     promoRouter);
app.use('/api/articles',  articleRouter);
app.use('/api/users',     userRouter);

app.get('/', (req, res) => res.json({ message: 'EndurACE API is running' }));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', method: req.method, path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));