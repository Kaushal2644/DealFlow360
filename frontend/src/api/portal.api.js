import axiosClient from './axiosClient';

export const portalLoginRequest = (email, password) =>
  axiosClient.post('/portal/login', { email, password }).then((res) => res.data);

export const getMyQuotations = () =>
  axiosClient.get('/portal/my-quotations').then((res) => res.data);

export const getMyQuotationById = (id) =>
  axiosClient.get(`/portal/my-quotations/${id}`).then((res) => res.data);

export const submitNegotiationRequest = (id, payload) =>
  axiosClient.post(`/portal/my-quotations/${id}/request`, payload).then((res) => res.data);

export const confirmQuotationByCustomer = (id, payload) =>
  axiosClient.post(`/portal/my-quotations/${id}/confirm`, payload).then((res) => res.data);


export const getPortalInventory = () =>
  axiosClient.get('/portal/inventory').then((res) => res.data);