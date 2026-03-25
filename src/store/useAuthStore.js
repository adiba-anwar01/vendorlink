import { create } from 'zustand';

const useAuthStore = create((set) => ({
  vendor: {
    id: 'vendor_001',
    name: 'Alex Johnson',
    email: 'alex@vendorlink.com',
    phone: '+1 (555) 234-5678',
    storeName: 'Alex\'s Premium Store',
    location: 'New York, NY',
    avatar: null,
  },
  isAuthenticated: true,
  setVendor: (vendor) => set({ vendor }),
  logout: () => set({ isAuthenticated: false, vendor: null }),
}));

export default useAuthStore;
