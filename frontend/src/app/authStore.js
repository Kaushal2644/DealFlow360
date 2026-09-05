import { create } from 'zustand';

const getStoredUser = () => {
  const raw = localStorage.getItem('dealflow360_user');
  if (!raw || raw === 'undefined') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('dealflow360_token') || null,

  login: (token, user) => {
    localStorage.setItem('dealflow360_token', token);
    localStorage.setItem('dealflow360_user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('dealflow360_token');
    localStorage.removeItem('dealflow360_user');
    set({ token: null, user: null });
  },

  isAuthenticated: () => !!localStorage.getItem('dealflow360_token'),
}));

export default useAuthStore;