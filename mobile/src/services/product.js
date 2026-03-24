import BASE_URL from './baseUrl';

const API = `${BASE_URL}/api`;

export const fetchProducts = async ({ category, search, minPrice, maxPrice } = {}) => {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  if (search)    params.append('search',   search);
  if (minPrice)  params.append('minPrice', minPrice);
  if (maxPrice)  params.append('maxPrice', maxPrice);
  const res  = await fetch(`${API}/products?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.products;
};

export const fetchProductById = async (id) => {
  const res  = await fetch(`${API}/products/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.product;
};

export const createProduct = async (formData) => {
  const res  = await fetch(`${API}/products`, { method: 'POST', body: formData });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.product;
};

export const updateProduct = async (id, formData) => {
  const res  = await fetch(`${API}/products/${id}`, { method: 'PUT', body: formData });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.product;
};

export const deleteProduct = async (id) => {
  const res  = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
};