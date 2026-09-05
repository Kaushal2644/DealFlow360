import axiosClient from './axiosClient';

export const loginRequest = (email, password) =>
  axiosClient.post('/auth/login', { email, password }).then((res) => res.data);

export const signupRequest = (payload) =>
  axiosClient.post('/auth/signup', payload).then((res) => res.data);

export const getMeRequest = () =>
  axiosClient.get('/auth/me').then((res) => res.data);