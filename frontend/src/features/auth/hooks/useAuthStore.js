import { create } from 'zustand';

const storedVendor = (() => {
  try { return JSON.parse(localStorage.getItem('vendor')); } catch { return null; }
})();

const getStoredVendorMeta = (user) => {
  if (!user?.email) return null;

  try {
    return JSON.parse(localStorage.getItem(`vendorMeta:${user.email}`));
  } catch {
    return null;
  }
};

const mergeVendorData = (user) => {
  const vendorMeta = getStoredVendorMeta(user);
  return vendorMeta ? { ...vendorMeta, ...user } : user;
};

const useAuthStore = create((set) => ({
  vendor: storedVendor,
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, user) => {
    const mergedUser = mergeVendorData(user);
    localStorage.setItem('token', token);
    localStorage.setItem('vendor', JSON.stringify(mergedUser));
    set({ vendor: mergedUser, isAuthenticated: true });
  },

  setVendor: (vendor) => {
    localStorage.setItem('vendor', JSON.stringify(vendor));
    if (vendor?.email) {
      localStorage.setItem(`vendorMeta:${vendor.email}`, JSON.stringify(vendor));
    }
    set({ vendor });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('vendor');
    set({ vendor: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
