import axiosClient from './axiosClient';

export const getBillingDetail = (quotationId) =>
  axiosClient.get(`/billing/${quotationId}`).then((res) => res.data);

export const confirmQuotationBilling = (quotationId) =>
  axiosClient.post(`/billing/confirm/${quotationId}`).then((res) => res.data);