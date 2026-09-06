import axiosClient from './axiosClient';

export const getInventoryOverview = () =>
  axiosClient.get('/warehouses/inventory/overview').then((res) => res.data);