import axiosClient from './axiosClient';

export const getPendingApprovals = () =>
  axiosClient.get('/approvals').then((res) => res.data);

export const getApprovalDetail = (id) =>
  axiosClient.get(`/approvals/${id}`).then((res) => res.data);

export const actOnApproval = (id, action, reason) =>
  axiosClient.post(`/approvals/${id}/act`, { action, reason }).then((res) => res.data);

export const adminApproveQuotation = (id, reason) =>
  axiosClient.post(`/approvals/${id}/admin-approve`, { reason }).then((res) => res.data);