import { configureStore } from '@reduxjs/toolkit';
import productReducer  from './productSlice';
import reviewReducer   from './reviewSlice';
import cartReducer     from './cartSlice';
import orderReducer    from './orderSlice';
import discountReducer from './discountSlice';
import articleReducer  from './articleSlice';
import userReducer     from './userSlice';

const store = configureStore({
  reducer: {
    products:  productReducer,
    reviews:   reviewReducer,
    cart:      cartReducer,
    orders:    orderReducer,
    discounts: discountReducer,
    articles:  articleReducer,
    users:     userReducer,
  },
});

export default store;