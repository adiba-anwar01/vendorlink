import { create } from 'zustand';

// Read persisted session from localStorage on first load
const storedVendor = (() => {
  try { return JSON.parse(localStorage.getItem('vendor')); } catch { return null; }
})();

const useAuthStore = create((set) => ({
  vendor: storedVendor,
  isAuthenticated: !!localStorage.getItem('token'),

  // Call this after a successful login API response
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('vendor', JSON.stringify(user));
    set({ vendor: user, isAuthenticated: true });
  },

  // Update vendor profile fields in state (and localStorage)
  setVendor: (vendor) => {
    localStorage.setItem('vendor', JSON.stringify(vendor));
    set({ vendor });
  },

  // Clear session — Navbar logout calls this
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('vendor');
    set({ vendor: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
