import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

// ── Platform guard ────────────────────────────────────────────────
// expo-sqlite is native-only. On web we return no-op stubs so the
// app still loads without crashing.
const isNative = Platform.OS === 'android' || Platform.OS === 'ios';

// ── Open / create DB (only on native) ────────────────────────────
let db = null;
if (isNative) {
  db = SQLite.openDatabase('endurace_cart.db');
}

// ── Helper: run a SQL statement in a transaction ──────────────────
const execSQL = (sql, params = []) => {
  if (!isNative || !db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            reject(error);
            return true; // rollback
          }
        );
      },
      (error) => reject(error)
    );
  });
};

// ── Helper: read-only query returning rows array ──────────────────
const querySQL = (sql, params = []) => {
  if (!isNative || !db) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    db.readTransaction(
      (tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result.rows._array),
          (_, error) => {
            reject(error);
            return true;
          }
        );
      },
      (error) => reject(error)
    );
  });
};

// ── Bootstrap table ───────────────────────────────────────────────
export const initCartDB = () => {
  if (!isNative || !db) return;
  db.transaction((tx) => {
    tx.executeSql(`
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
  });
};

// ── Load all cart items ───────────────────────────────────────────
// Returns a Promise<Array> — cartSlice uses this inside createAsyncThunk
export const loadCartFromDB = () =>
  querySQL('SELECT * FROM cart ORDER BY rowid ASC');

// ── Upsert a single item ──────────────────────────────────────────
export const upsertCartItem = (item) => {
  execSQL(
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
  ).catch((e) => console.error('upsertCartItem error:', e));
};

// ── Update quantity for one item ──────────────────────────────────
export const updateCartItemQty = (id, quantity) => {
  execSQL('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, id]).catch(
    (e) => console.error('updateCartItemQty error:', e)
  );
};

// ── Delete a single item ──────────────────────────────────────────
export const deleteCartItem = (id) => {
  execSQL('DELETE FROM cart WHERE id = ?', [id]).catch((e) =>
    console.error('deleteCartItem error:', e)
  );
};

// ── Delete multiple items by id array ────────────────────────────
export const deleteCartItems = (ids) => {
  if (!ids || ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(', ');
  execSQL(`DELETE FROM cart WHERE id IN (${placeholders})`, ids).catch((e) =>
    console.error('deleteCartItems error:', e)
  );
};

// ── Wipe entire cart (called after checkout) ─────────────────────
export const clearCartDB = () => {
  execSQL('DELETE FROM cart').catch((e) =>
    console.error('clearCartDB error:', e)
  );
};