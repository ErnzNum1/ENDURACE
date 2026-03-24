import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productService from '../services/product';

// ── Async Thunks ──────────────────────────────────────────────────

export const loadProducts = createAsyncThunk(
  'products/loadAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await productService.fetchProducts(filters);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/add',
  async (formData, { rejectWithValue }) => {
    try {
      return await productService.createProduct(formData);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const editProduct = createAsyncThunk(
  'products/edit',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await productService.updateProduct(id, formData);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const removeProduct = createAsyncThunk(
  'products/remove',
  async (id, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProductError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // loadProducts
    builder
      .addCase(loadProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // addProduct
    builder
      .addCase(addProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // editProduct
    builder
      .addCase(editProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // removeProduct
    builder
      .addCase(removeProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;