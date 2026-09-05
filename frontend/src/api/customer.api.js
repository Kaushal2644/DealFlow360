import axiosClient from './axiosClient';

export const getCustomers = () => axiosClient.get('/customers').then((res) => res.data);
export const createCustomer = (payload) =>
  axiosClient.post('/customers', payload).then((res) => res.data);