import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderService from '../services/order';

// ── Async Thunks ──────────────────────────────────────────────────

export const createOrder = createAsyncThunk(
  'orders/create',
  async ({ items, total, shippingAddress, paymentMethod, accessToken }, { rejectWithValue }) => {
    try {
      return await orderService.placeOrder(
        { items, total, shippingAddress, paymentMethod },
        accessToken
      );
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const loadMyOrders = createAsyncThunk(
  'orders/loadMine',
  async (accessToken, { rejectWithValue }) => {
    try {
      return await orderService.fetchMyOrders(accessToken);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const loadOrderById = createAsyncThunk(
  'orders/loadOne',
  async ({ id, accessToken }, { rejectWithValue }) => {
    try {
      return await orderService.fetchOrderById(id, accessToken);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const loadAllOrders = createAsyncThunk(
  'orders/loadAll',
  async (accessToken, { rejectWithValue }) => {
    try {
      return await orderService.fetchAllOrders(accessToken);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const changeOrderStatus = createAsyncThunk(
  'orders/changeStatus',
  async ({ id, status, accessToken }, { rejectWithValue }) => {
    try {
      return await orderService.updateStatus(id, status, accessToken);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders:   [],   // logged-in user's orders
    allOrders:  [],   // admin view
    selected:   null, // currently viewed order detail
    loading:    false,
    error:      null,
  },
  reducers: {
    clearOrderError:   (state) => { state.error = null; },
    clearSelectedOrder:(state) => { state.selected = null; },
    // Patch a single order's status in both lists (used after push-notification tap)
    patchOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const patchList = (list) => {
        const idx = list.findIndex((o) => o._id === id);
        if (idx !== -1) list[idx] = { ...list[idx], status };
      };
      patchList(state.myOrders);
      patchList(state.allOrders);
      if (state.selected?._id === id) state.selected = { ...state.selected, status };
    },
  },
  extraReducers: (builder) => {
    const pending  = (s) => { s.loading = true;  s.error = null; };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; };

    // createOrder
    builder
      .addCase(createOrder.pending, pending)
      .addCase(createOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.myOrders.unshift(payload);
        state.selected = payload;
      })
      .addCase(createOrder.rejected, rejected);

    // loadMyOrders
    builder
      .addCase(loadMyOrders.pending, pending)
      .addCase(loadMyOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.myOrders = payload;
      })
      .addCase(loadMyOrders.rejected, rejected);

    // loadOrderById
    builder
      .addCase(loadOrderById.pending, pending)
      .addCase(loadOrderById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selected = payload;
      })
      .addCase(loadOrderById.rejected, rejected);

    // loadAllOrders (admin)
    builder
      .addCase(loadAllOrders.pending, pending)
      .addCase(loadAllOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.allOrders = payload;
      })
      .addCase(loadAllOrders.rejected, rejected);

    // changeOrderStatus (admin)
    builder
      .addCase(changeOrderStatus.pending, pending)
      .addCase(changeOrderStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Update in allOrders
        const idx = state.allOrders.findIndex((o) => o._id === payload._id);
        if (idx !== -1) state.allOrders[idx] = payload;
        // Update in myOrders if present
        const mi = state.myOrders.findIndex((o) => o._id === payload._id);
        if (mi !== -1) state.myOrders[mi] = payload;
        if (state.selected?._id === payload._id) state.selected = payload;
      })
      .addCase(changeOrderStatus.rejected, rejected);
  },
});

export const { clearOrderError, clearSelectedOrder, patchOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;