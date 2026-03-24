import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

// ── Platform guard ────────────────────────────────────────────────
// expo-sqlite is native-only. On web we return no-op stubs so the
// app still loads without crashing.
const isNative = Platform.OS === 'android' || Platform.OS === 'ios';

// ── DB instance (lazy, shared) ────────────────────────────────────
// expo-sqlite v15 (SDK 54) uses openDatabaseAsync instead of openDatabase.
let dbPromise = null;

const getDB = () => {
  if (!isNative) return Promise.resolve(null);
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('endurace_cart.db');
  }
  return dbPromise;
};

// ── Bootstrap table ───────────────────────────────────────────────
export const initCartDB = async () => {
  if (!isNative) return;
  try {
    const db = await getDB();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id          TEXT PRIMARY KEY,
        productId   TEXT NOT NULL,
        name        TEXT NOT NULL,
        variation   TEXT DEFAULT '',
        price       REAL NOT NULL,
        quantity    INTEGER NOT NULL DEFAULT 1,
        image       TEXT DEFAULT ''
      );
    `);
  } catch (e) {
    console.error('initCartDB error:', e);
  }
};

// ── Load all cart items ───────────────────────────────────────────
// Returns a Promise<Array> — cartSlice uses this inside createAsyncThunk
export const loadCartFromDB = async () => {
  if (!isNative) return [];
  try {
    const db = await getDB();
    const rows = await db.getAllAsync('SELECT * FROM cart ORDER BY rowid ASC');
    return rows;
  } catch (e) {
    console.error('loadCartFromDB error:', e);
    return [];
  }
};

// ── Upsert a single item ──────────────────────────────────────────
export const upsertCartItem = async (item) => {
  if (!isNative) return;
  try {
    const db = await getDB();
    await db.runAsync(
      `INSERT OR REPLACE INTO cart (id, productId, name, variation, price, quantity, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.productId ?? item.id,
        item.name,
        item.variation ?? '',
        item.price,
        item.quantity,
        item.image ?? '',
      ]
    );
  } catch (e) {
    console.error('upsertCartItem error:', e);
  }
};

// ── Update quantity for one item ──────────────────────────────────
export const updateCartItemQty = async (id, quantity) => {
  if (!isNative) return;
  try {
    const db = await getDB();
    await db.runAsync('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, id]);
  } catch (e) {
    console.error('updateCartItemQty error:', e);
  }
};

// ── Delete a single item ──────────────────────────────────────────
export const deleteCartItem = async (id) => {
  if (!isNative) return;
  try {
    const db = await getDB();
    await db.runAsync('DELETE FROM cart WHERE id = ?', [id]);
  } catch (e) {
    console.error('deleteCartItem error:', e);
  }
};

// ── Delete multiple items by id array ────────────────────────────
export const deleteCartItems = async (ids) => {
  if (!isNative || !ids || ids.length === 0) return;
  try {
    const db = await getDB();
    const placeholders = ids.map(() => '?').join(', ');
    await db.runAsync(`DELETE FROM cart WHERE id IN (${placeholders})`, ids);
  } catch (e) {
    console.error('deleteCartItems error:', e);
  }
};

// ── Wipe entire cart (called after checkout) ──────────────────────
export const clearCartDB = async () => {
  if (!isNative) return;
  try {
    const db = await getDB();
    await db.runAsync('DELETE FROM cart');
  } catch (e) {
    console.error('clearCartDB error:', e);
  }
};