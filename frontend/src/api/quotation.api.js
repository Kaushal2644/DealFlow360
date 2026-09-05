import axiosClient from './axiosClient';

export const getQuotations = (status) =>
  axiosClient.get('/quotations', { params: status ? { status } : {} }).then((res) => res.data);

export const getQuotationById = (id) =>
  axiosClient.get(`/quotations/${id}`).then((res) => res.data);

export const createQuotation = (customerId) =>
  axiosClient.post('/quotations', { customerId }).then((res) => res.data);

export const addLine = (quotationId, payload) =>
  axiosClient.post(`/quotations/${quotationId}/lines`, payload).then((res) => res.data);

export const submitForApproval = (quotationId) =>
  axiosClient.post(`/quotations/${quotationId}/submit`).then((res) => res.data);

export const getUpsellSuggestions = (quotationId) =>
  axiosClient.get(`/upsell/suggestions/${quotationId}`).then((res) => res.data);