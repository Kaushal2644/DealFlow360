import { create } from 'zustand';

const usePortalAuthStore = create((set) => ({
  token: localStorage.getItem('dealflow360_portal_token'),
  customer: JSON.parse(
    localStorage.getItem('dealflow360_portal_customer') || 'null'
  ),

  login: (token, customer) => {
    localStorage.setItem('dealflow360_portal_token', token);
    localStorage.setItem(
      'dealflow360_portal_customer',
      JSON.stringify(customer)
    );

    set({
      token,
      customer,
    });
  },

  logout: () => {
    localStorage.removeItem('dealflow360_portal_token');
    localStorage.removeItem('dealflow360_portal_customer');

    set({
      token: null,
      customer: null,
    });
  },
}));

export default usePortalAuthStore;