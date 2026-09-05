import axiosClient from './axiosClient';

export const getProducts = (filters) =>
  axiosClient.get('/products', { params: filters }).then((res) => res.data);

export const getProductById = (id) =>
  axiosClient.get(`/products/${id}`).then((res) => res.data);

export const createProduct = (payload) =>
  axiosClient.post('/products', payload).then((res) => res.data);

export const updateProduct = (id, payload) =>
  axiosClient.put(`/products/${id}`, payload).then((res) => res.data);

export const deleteProduct = (id) =>
  axiosClient.delete(`/products/${id}`).then((res) => res.data);