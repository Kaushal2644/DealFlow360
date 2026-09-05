import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

axiosClient.interceptors.request.use((config) => {
  const isPortalRequest = config.url?.startsWith('/portal');
  const token = isPortalRequest
    ? localStorage.getItem('dealflow360_portal_token')
    : localStorage.getItem('dealflow360_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isPortalRequest = error.config?.url?.includes('/portal');
      if (isPortalRequest) {
        localStorage.removeItem('dealflow360_portal_token');
        localStorage.removeItem('dealflow360_portal_customer');
        window.location.href = '/portal/login';
      } else {
        localStorage.removeItem('dealflow360_token');
        localStorage.removeItem('dealflow360_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;