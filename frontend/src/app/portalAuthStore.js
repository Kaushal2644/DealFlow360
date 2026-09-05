import { create } from 'zustand';

const getStoredCustomer = () => {
  const raw = localStorage.getItem('dealflow360_portal_customer');
  if (!raw || raw === 'undefined') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const usePortalAuthStore = create((set) => ({
  customer: getStoredCustomer(),
  token: localStorage.getItem('dealflow360_portal_token') || null,

  login: (token, customer) => {
    localStorage.setItem('dealflow360_portal_token', token);
    localStorage.setItem('dealflow360_portal_customer', JSON.stringify(customer));
    set({ token, customer });
  },

  logout: () => {
    localStorage.removeItem('dealflow360_portal_token');
    localStorage.removeItem('dealflow360_portal_customer');
    set({ token: null, customer: null });
  },
}));

export default usePortalAuthStore;