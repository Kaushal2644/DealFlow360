import axiosClient from './axiosClient';

export const getSubscriptions = (status) =>
  axiosClient.get('/subscriptions', { params: status ? { status } : {} }).then((res) => res.data);

export const getSubscriptionById = (id) =>
  axiosClient.get(`/subscriptions/${id}`).then((res) => res.data);

export const modifySubscriptionQty = (id, newQty) =>
  axiosClient.put(`/subscriptions/${id}/qty`, { newQty }).then((res) => res.data);

export const cancelSubscription = (id) =>
  axiosClient.post(`/subscriptions/${id}/cancel`).then((res) => res.data);