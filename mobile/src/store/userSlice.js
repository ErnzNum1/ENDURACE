import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'web'
  ? ''
  : Constants.expoConfig?.extra?.apiUrl || 'http://192.168.100.5:5000';
const API = `${BASE_URL}/api/users`;

const safeFetch = async (url, options = {}) => {
  const res = await fetch(url, options);
  const ct  = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`);
  }
  return res;
};

export const loadDashboardStats = createAsyncThunk(
  'users/loadStats',
  async (accessToken, { rejectWithValue }) => {
    try {
      const res  = await safeFetch(`${API}/stats`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.stats;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

export const loadAllUsers = createAsyncThunk(
  'users/loadAll',
  async (accessToken, { rejectWithValue }) => {
    try {
      const res  = await safeFetch(API, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.users;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'users/toggleStatus',
  async ({ userId, isActive, accessToken }, { rejectWithValue }) => {
    try {
      const res = await safeFetch(`${API}/${userId}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body:    JSON.stringify({ isActive }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.user;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

export const changeUserRole = createAsyncThunk(
  'users/changeRole',
  async ({ userId, role, accessToken }, { rejectWithValue }) => {
    try {
      const res = await safeFetch(`${API}/${userId}/role`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body:    JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.user;
    } catch (e) { return rejectWithValue(e.message); }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: { list: [], stats: null, loading: false, error: null },
  reducers: { clearUserError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    const p = (s) => { s.loading = true;  s.error = null; };
    const r = (s, a) => { s.loading = false; s.error = a.payload; };
    const updateUser = (s, a) => {
      s.loading = false;
      const idx = s.list.findIndex((u) => u._id === a.payload._id);
      if (idx !== -1) s.list[idx] = { ...s.list[idx], ...a.payload };
    };

    builder.addCase(loadDashboardStats.pending, p)
           .addCase(loadDashboardStats.fulfilled, (s, a) => { s.loading = false; s.stats = a.payload; })
           .addCase(loadDashboardStats.rejected, r);

    builder.addCase(loadAllUsers.pending, p)
           .addCase(loadAllUsers.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
           .addCase(loadAllUsers.rejected, r);

    builder.addCase(toggleUserStatus.pending, p)
           .addCase(toggleUserStatus.fulfilled, updateUser)
           .addCase(toggleUserStatus.rejected, r);

    builder.addCase(changeUserRole.pending, p)
           .addCase(changeUserRole.fulfilled, updateUser)
           .addCase(changeUserRole.rejected, r);
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;