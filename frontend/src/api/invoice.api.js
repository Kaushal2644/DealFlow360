import axiosClient from './axiosClient';

export const getInvoices = (status) =>
  axiosClient.get('/invoices', { params: status ? { status } : {} }).then((res) => res.data);

export const getInvoiceById = (id) =>
  axiosClient.get(`/invoices/${id}`).then((res) => res.data);

export const updateInvoiceStage = (id, stage) =>
  axiosClient.put(`/invoices/${id}/stage`, { stage }).then((res) => res.data);

export const recordPayment = (invoiceId, amount, method) =>
  axiosClient.post(`/invoices/${invoiceId}/payments`, { amount, method }).then((res) => res.data);

export const getPaymentsForInvoice = (invoiceId) =>
  axiosClient.get(`/invoices/${invoiceId}/payments`).then((res) => res.data);