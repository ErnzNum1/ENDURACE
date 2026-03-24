import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as discountService from '../services/discount';

// ── Thunks ────────────────────────────────────────────────────────

export const validateCode = createAsyncThunk(
  'discounts/validate',
  async ({ code, orderTotal, accessToken }, { rejectWithValue }) => {
    try {
      return await discountService.validateDiscountCode(code, orderTotal, accessToken);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const loadAdminDiscounts = createAsyncThunk(
  'discounts/loadAll',
  async (accessToken, { rejectWithValue }) => {
    try {
      return await discountService.fetchAllDiscounts(accessToken);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const addDiscount = createAsyncThunk(
  'discounts/add',
  async ({ payload, accessToken }, { rejectWithValue }) => {
    try {
      return await discountService.createDiscountCode(payload, accessToken);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const editDiscount = createAsyncThunk(
  'discounts/edit',
  async ({ id, payload, accessToken }, { rejectWithValue }) => {
    try {
      return await discountService.updateDiscountCode(id, payload, accessToken);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const removeDiscount = createAsyncThunk(
  'discounts/remove',
  async ({ id, accessToken }, { rejectWithValue }) => {
    try {
      await discountService.deleteDiscountCode(id, accessToken);
      return id;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const sendPromoNotification = createAsyncThunk(
  'discounts/broadcastPromo',
  async ({ title, body, discountCode, accessToken }, { rejectWithValue }) => {
    try {
      return await discountService.broadcastPromoNotification({ title, body, discountCode }, accessToken);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────

const discountSlice = createSlice({
  name: 'discounts',
  initialState: {
    // Admin list
    list:    [],
    // Currently applied discount at checkout
    applied: null,  // { code, type, value, discountAmount, finalTotal }
    loading: false,
    error:   null,
    // Broadcast result
    broadcastResult: null,
  },
  reducers: {
    clearAppliedDiscount: (state) => { state.applied = null; },
    clearDiscountError:   (state) => { state.error = null; },
    clearBroadcastResult: (state) => { state.broadcastResult = null; },
  },
  extraReducers: (builder) => {
    const pending  = (s) => { s.loading = true;  s.error = null; };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; };

    // validateCode
    builder
      .addCase(validateCode.pending,   pending)
      .addCase(validateCode.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.applied = payload;
      })
      .addCase(validateCode.rejected,  rejected);

    // loadAdminDiscounts
    builder
      .addCase(loadAdminDiscounts.pending,   pending)
      .addCase(loadAdminDiscounts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list    = payload;
      })
      .addCase(loadAdminDiscounts.rejected,  rejected);

    // addDiscount
    builder
      .addCase(addDiscount.pending,   pending)
      .addCase(addDiscount.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list.unshift(payload);
      })
      .addCase(addDiscount.rejected,  rejected);

    // editDiscount
    builder
      .addCase(editDiscount.pending,   pending)
      .addCase(editDiscount.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.list.findIndex((d) => d._id === payload._id);
        if (idx !== -1) state.list[idx] = payload;
      })
      .addCase(editDiscount.rejected,  rejected);

    // removeDiscount
    builder
      .addCase(removeDiscount.pending,   pending)
      .addCase(removeDiscount.fulfilled, (state, { payload: id }) => {
        state.loading = false;
        state.list    = state.list.filter((d) => d._id !== id);
      })
      .addCase(removeDiscount.rejected,  rejected);

    // sendPromoNotification
    builder
      .addCase(sendPromoNotification.pending,   pending)
      .addCase(sendPromoNotification.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.broadcastResult = payload;
      })
      .addCase(sendPromoNotification.rejected,  rejected);
  },
});

export const {
  clearAppliedDiscount,
  clearDiscountError,
  clearBroadcastResult,
} = discountSlice.actions;

export default discountSlice.reducer;