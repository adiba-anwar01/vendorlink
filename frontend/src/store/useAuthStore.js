import { create } from 'zustand';

const storedVendor = (() => {
  try { return JSON.parse(localStorage.getItem('vendor')); } catch { return null; }
})();

const useAuthStore = create((set) => ({
  vendor: storedVendor,
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('vendor', JSON.stringify(user));
    set({ vendor: user, isAuthenticated: true });
  },

  setVendor: (vendor) => {
    localStorage.setItem('vendor', JSON.stringify(vendor));
    set({ vendor });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('vendor');
    set({ vendor: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
