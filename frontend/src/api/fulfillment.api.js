import axiosClient from './axiosClient';

export const getFulfillmentOrders = () =>
  axiosClient.get('/fulfillment').then((res) => res.data);

export const getFulfillmentById = (id) =>
  axiosClient.get(`/fulfillment/${id}`).then((res) => res.data);

export const generateFulfillmentSuggestion = (quotationId) =>
  axiosClient.post(`/fulfillment/generate/${quotationId}`).then((res) => res.data);

export const acceptSplit = (id) =>
  axiosClient.post(`/fulfillment/${id}/accept`).then((res) => res.data);

export const manualOverrideSplit = (id, splits) =>
  axiosClient.post(`/fulfillment/${id}/override`, { splits }).then((res) => res.data);

export const consolidateBackorder = (id) =>
  axiosClient.post(`/fulfillment/${id}/consolidate`).then((res) => res.data);