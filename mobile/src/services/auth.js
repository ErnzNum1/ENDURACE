import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BASE_URL =
  Platform.OS === 'web'
    ? ''
    : Constants.expoConfig?.extra?.apiUrl || 'http://192.168.68.138:5000';

const API = `${BASE_URL}/api/auth`;
const isNative = Platform.OS === 'android' || Platform.OS === 'ios';

const safeFetch = async (url, options = {}) => {
  const res = await fetch(url, options);
  const ct  = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server returned non-JSON (status ${res.status}).\nURL: ${url}\nBody: ${text.slice(0, 200)}`);
  }
  return res;
};

const storage = {
  setItem: async (key, value) => {
    if (isNative) await SecureStore.setItemAsync(key, value);
    else localStorage.setItem(key, value);
  },
  getItem: async (key) => {
    if (isNative) return await SecureStore.getItemAsync(key);
    return localStorage.getItem(key);
  },
  removeItem: async (key) => {
    if (isNative) await SecureStore.deleteItemAsync(key);
    else localStorage.removeItem(key);
  },
};

const KEYS = { ACCESS: 'endurace_access_token', REFRESH: 'endurace_refresh_token', USER: 'endurace_user' };

export const saveTokens = async (accessToken, refreshToken, user) => {
  await storage.setItem(KEYS.ACCESS,  accessToken);
  await storage.setItem(KEYS.REFRESH, refreshToken);
  await storage.setItem(KEYS.USER,    JSON.stringify(user));
};

export const getStoredTokens = async () => {
  const accessToken  = await storage.getItem(KEYS.ACCESS);
  const refreshToken = await storage.getItem(KEYS.REFRESH);
  const userStr      = await storage.getItem(KEYS.USER);
  return { accessToken, refreshToken, user: userStr ? JSON.parse(userStr) : null };
};

export const clearTokens = async () => {
  await storage.removeItem(KEYS.ACCESS);
  await storage.removeItem(KEYS.REFRESH);
  await storage.removeItem(KEYS.USER);
};

export const registerUser = async ({ firstName, lastName, email, password }) => {
  const res  = await safeFetch(`${API}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, lastName, email, password }) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
};

export const loginUser = async ({ email, password }) => {
  const res  = await safeFetch(`${API}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
};

export const refreshAccessToken = async (refreshToken) => {
  const res  = await safeFetch(`${API}/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
};

export const logoutUser = async (accessToken) => {
  await fetch(`${API}/logout`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => {});
  await clearTokens();
};

export const googleOAuth = async (payload) => {
  const res  = await safeFetch(`${API}/oauth/google`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
};

export const facebookOAuth = async (payload) => {
  const res  = await safeFetch(`${API}/oauth/facebook`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
};

export const fetchProfile = async (accessToken) => {
  const res  = await safeFetch(`${API}/profile`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.user;
};

export const updateUserProfile = async (accessToken, formData) => {
  const res = await safeFetch(`${API}/profile`, {
    method:  'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.user;
};

export const savePushToken = async (accessToken, pushToken) => {
  if (!isNative) return;
  await fetch(`${API}/push-token`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ pushToken }),
  }).catch(() => {});
};

export const deactivateUserAccount = async (accessToken) => {
  const res  = await safeFetch(`${API}/deactivate`, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  await clearTokens();
  return data;
};