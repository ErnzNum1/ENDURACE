import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BASE_URL =
  Platform.OS === 'web'
    ? ''
    : Constants.expoConfig?.extra?.apiUrl || 'http://192.168.68.138:5000';

const API = `${BASE_URL}/api/users`;

const safeFetch = async (url, options = {}) => {
  const res = await fetch(url, options);
  const ct  = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server returned non-JSON (status ${res.status}).\nBody: ${text.slice(0, 200)}`);
  }
  return res;
};

export const fetchDashboardStats = async (accessToken) => {
  const res  = await safeFetch(`${API}/stats`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.stats;
};

export const fetchAllUsers = async (accessToken) => {
  const res  = await safeFetch(API, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.users;
};

export const setUserStatus = async (userId, isActive, accessToken) => {
  const res = await safeFetch(`${API}/${userId}/status`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body:    JSON.stringify({ isActive }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.user;
};

export const setUserRole = async (userId, role, accessToken) => {
  const res = await safeFetch(`${API}/${userId}/role`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body:    JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.user;
};