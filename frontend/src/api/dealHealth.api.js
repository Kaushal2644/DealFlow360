import axiosClient from './axiosClient';

export const getFlags = (type) =>
  axiosClient.get('/deal-health', { params: type ? { type } : {} }).then((res) => res.data);

export const triggerScan = () =>
  axiosClient.post('/deal-health/scan').then((res) => res.data);

export const escalateFlag = (id, reason) =>
  axiosClient.post(`/deal-health/${id}/escalate`, { reason }).then((res) => res.data);

export const nudgeRep = (id) =>
  axiosClient.post(`/deal-health/${id}/nudge`).then((res) => res.data);

export const resolveFlag = (id) =>
  axiosClient.post(`/deal-health/${id}/resolve`).then((res) => res.data);