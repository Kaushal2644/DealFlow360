import axiosClient from './axiosClient';

export const getDiscountTiers = () => axiosClient.get('/discount-config/tiers').then((res) => res.data);
export const upsertDiscountTier = (payload) =>
  axiosClient.post('/discount-config/tiers', payload).then((res) => res.data);

export const getCategoryCeilings = () =>
  axiosClient.get('/discount-config/category-ceilings').then((res) => res.data);
export const upsertCategoryCeiling = (payload) =>
  axiosClient.post('/discount-config/category-ceilings', payload).then((res) => res.data);

export const getApprovalChainRules = () =>
  axiosClient.get('/discount-config/approval-rules').then((res) => res.data);
export const createApprovalChainRule = (payload) =>
  axiosClient.post('/discount-config/approval-rules', payload).then((res) => res.data);
export const deleteApprovalChainRule = (id) =>
  axiosClient.delete(`/discount-config/approval-rules/${id}`).then((res) => res.data);