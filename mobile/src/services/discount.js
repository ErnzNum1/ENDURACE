import BASE_URL from './baseUrl';

const API      = `${BASE_URL}/api/discounts`;
const PROMO    = `${BASE_URL}/api/promo`;

export const validateDiscountCode = async (code, orderTotal, accessToken) => {
  const res  = await fetch(`${API}/validate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body:    JSON.stringify({ code, orderTotal }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.discount;
};

export const fetchAllDiscounts = async (accessToken) => {
  const res  = await fetch(API, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.discounts;
};

export const createDiscountCode = async (payload, accessToken) => {
  const res  = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body:    JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.discount;
};

export const updateDiscountCode = async (id, payload, accessToken) => {
  const res  = await fetch(`${API}/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body:    JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.discount;
};

export const deleteDiscountCode = async (id, accessToken) => {
  const res  = await fetch(`${API}/${id}`, {
    method:  'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
};

export const broadcastPromoNotification = async ({ title, body, discountCode }, accessToken) => {
  const res  = await fetch(`${PROMO}/broadcast`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body:    JSON.stringify({ title, body, discountCode }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
};