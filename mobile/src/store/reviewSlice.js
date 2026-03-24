import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as reviewService from '../services/review';

// ── Async Thunks ──────────────────────────────────────────────────

export const loadProductReviews = createAsyncThunk(
  'reviews/loadForProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const reviews = await reviewService.fetchProductReviews(productId);
      return { productId, reviews };
    } catch (e) { return rejectWithValue(e.message); }
  }
);

export const loadMyReviews = createAsyncThunk(
  'reviews/loadMine',
  async (accessToken, { rejectWithValue }) => {
    try { return await reviewService.fetchMyReviews(accessToken); }
    catch (e) { return rejectWithValue(e.message); }
  }
);

// Loads reviews for a product AND checks if current user already reviewed it
export const loadMyReviewForProduct = createAsyncThunk(
  'reviews/loadMyForProduct',
  async ({ productId, accessToken }, { rejectWithValue }) => {
    try {
      const result = await reviewService.checkCanReview(productId, accessToken);
      return {
        productId,
        canReview:      result.canReview,
        existingReview: result.existingReview || null,
        orderId:        result.orderId || null,
      };
    } catch (e) { return rejectWithValue(e.message); }
  }
);

export const submitReview = createAsyncThunk(
  'reviews/submit',
  async ({ productId, rating, comment, accessToken }, { getState, rejectWithValue }) => {
    try {
      // Get orderId from canReview check stored in state
      const state   = getState();
      const canData = state.reviews.canReviewByProduct?.[productId];
      const orderId = canData?.orderId;
      if (!orderId) throw new Error('No eligible order found for this product.');
      const review = await reviewService.submitReview(
        { productId, orderId, rating, comment },
        accessToken
      );
      return { productId, review };
    } catch (e) { return rejectWithValue(e.message); }
  }
);

export const editReview = createAsyncThunk(
  'reviews/edit',
  async ({ reviewId, productId, rating, comment, accessToken }, { rejectWithValue }) => {
    try {
      const review = await reviewService.editReview(reviewId, { rating, comment }, accessToken);
      return { productId, review };
    } catch (e) { return rejectWithValue(e.message); }
  }
);

export const removeReview = createAsyncThunk(
  'reviews/remove',
  async ({ reviewId, productId, accessToken }, { rejectWithValue }) => {
    try {
      await reviewService.removeReview(reviewId, accessToken);
      return { reviewId, productId };
    } catch (e) { return rejectWithValue(e.message); }
  }
);

// ── Slice ─────────────────────────────────────────────────────────
const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    byProduct:          {},   // { [productId]: Review[] }
    myReviewByProduct:  {},   // { [productId]: Review | null }
    canReviewByProduct: {},   // { [productId]: { canReview, orderId } }
    myReviews:          [],
    loading:            false,
    error:              null,
  },
  reducers: {
    clearReviewError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const p = (s) => { s.loading = true;  s.error = null; };
    const r = (s, a) => { s.loading = false; s.error = a.payload; };

    // loadProductReviews
    builder
      .addCase(loadProductReviews.pending, p)
      .addCase(loadProductReviews.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.byProduct[payload.productId] = payload.reviews;
      })
      .addCase(loadProductReviews.rejected, r);

    // loadMyReviews
    builder
      .addCase(loadMyReviews.pending, p)
      .addCase(loadMyReviews.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.myReviews = payload;
      })
      .addCase(loadMyReviews.rejected, r);

    // loadMyReviewForProduct
    builder
      .addCase(loadMyReviewForProduct.pending, p)
      .addCase(loadMyReviewForProduct.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.myReviewByProduct[payload.productId]  = payload.existingReview;
        state.canReviewByProduct[payload.productId] = {
          canReview: payload.canReview,
          orderId:   payload.orderId,
        };
      })
      .addCase(loadMyReviewForProduct.rejected, (state) => {
        state.loading = false;
        // Don't set error — this is a background check
      });

    // submitReview
    builder
      .addCase(submitReview.pending, p)
      .addCase(submitReview.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { productId, review } = payload;
        if (!state.byProduct[productId]) state.byProduct[productId] = [];
        state.byProduct[productId].unshift(review);
        state.myReviewByProduct[productId]  = review;
        state.canReviewByProduct[productId] = { canReview: false, orderId: null };
        state.myReviews.unshift(review);
      })
      .addCase(submitReview.rejected, r);

    // editReview
    builder
      .addCase(editReview.pending, p)
      .addCase(editReview.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { productId, review } = payload;
        if (state.byProduct[productId]) {
          const idx = state.byProduct[productId].findIndex((rv) => rv._id === review._id);
          if (idx !== -1) state.byProduct[productId][idx] = review;
        }
        state.myReviewByProduct[productId] = review;
        const mi = state.myReviews.findIndex((rv) => rv._id === review._id);
        if (mi !== -1) state.myReviews[mi] = review;
      })
      .addCase(editReview.rejected, r);

    // removeReview
    builder
      .addCase(removeReview.pending, p)
      .addCase(removeReview.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { reviewId, productId } = payload;
        if (state.byProduct[productId]) {
          state.byProduct[productId] = state.byProduct[productId].filter((rv) => rv._id !== reviewId);
        }
        if (state.myReviewByProduct[productId]?._id === reviewId) {
          state.myReviewByProduct[productId] = null;
        }
        state.myReviews = state.myReviews.filter((rv) => rv._id !== reviewId);
      })
      .addCase(removeReview.rejected, r);
  },
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;