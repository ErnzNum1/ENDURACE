import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loadCartFromDB,
  upsertCartItem,
  updateCartItemQty,
  deleteCartItem,
  deleteCartItems,
  clearCartDB,
} from '../utils/cartDatabase';

// ── Bootstrap: load persisted cart on app open ────────────────────
export const hydrateCart = createAsyncThunk(
  'cart/hydrate',
  async (_, { rejectWithValue }) => {
    try {
      // loadCartFromDB now returns a Promise (expo-sqlite SDK 50 compatible)
      const items = await loadCartFromDB();
      return items;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],       // { id, productId, name, variation, price, quantity, image }
    hydrated: false, // true once SQLite has been read
    error: null,
  },
  reducers: {
    // Add item — if already in cart, increment qty instead
    addToCart: (state, action) => {
      const incoming = action.payload;
      const existing = state.items.find((i) => i.id === incoming.id);
      if (existing) {
        existing.quantity += incoming.quantity ?? 1;
        updateCartItemQty(existing.id, existing.quantity);
      } else {
        const item = { ...incoming, quantity: incoming.quantity ?? 1 };
        state.items.push(item);
        upsertCartItem(item);
      }
    },

    // Update quantity for one item
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.quantity = quantity;
        updateCartItemQty(id, quantity);
      }
    },

    // Remove a single item
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((i) => i.id !== id);
      deleteCartItem(id);
    },

    // Remove multiple items (checked items batch-remove)
    removeItems: (state, action) => {
      const ids = action.payload; // string[]
      state.items = state.items.filter((i) => !ids.includes(i.id));
      deleteCartItems(ids);
    },

    // Wipe entire cart after checkout
    clearCart: (state) => {
      state.items = [];
      clearCartDB();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateCart.fulfilled, (state, action) => {
        state.items = action.payload ?? [];
        state.hydrated = true;
      })
      .addCase(hydrateCart.rejected, (state, action) => {
        state.hydrated = true; // don't block UI even on error
        state.error = action.payload;
      });
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  removeItems,
  clearCart,
} = cartSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export default cartSlice.reducer;