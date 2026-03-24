import BASE_URL from './baseUrl';

const API = `${BASE_URL}/api/orders`;

export const placeOrder = async (payload, accessToken) => {
  const res  = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body:    JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.order;
};

export const fetchMyOrders = async (accessToken) => {
  const res  = await fetch(`${API}/my`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.orders;
};

export const fetchOrderById = async (id, accessToken) => {
  const res  = await fetch(`${API}/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.order;
};

export const fetchAllOrders = async (accessToken) => {
  const res  = await fetch(API, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.orders;
};

export const updateStatus = async (id, status, accessToken) => {
  const res  = await fetch(`${API}/${id}/status`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body:    JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.order;
};