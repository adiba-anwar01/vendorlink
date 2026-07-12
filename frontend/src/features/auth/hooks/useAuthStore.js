import { create } from 'zustand';
import api from '@/api/api';

const getGuestLocation = () => {
  if (localStorage.getItem('token')) return null;
  try { return JSON.parse(localStorage.getItem('guestLocation')); } catch { return null; }
};

const useAuthStore = create((set, get) => ({
  vendor: getGuestLocation(),
  isAuthenticated: !!localStorage.getItem('token'),
  loadingProfile: false,

  fetchProfile: async () => {
    if (!get().isAuthenticated) return;
    set({ loadingProfile: true });
    try {
      const response = await api.get('/auth/profile');
      set({ vendor: response.data, isAuthenticated: true });
    } catch (error) {
      console.error("Failed to fetch profile", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        set({ vendor: null, isAuthenticated: false });
      }
    } finally {
      set({ loadingProfile: false });
    }
  },

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.removeItem('vendor'); 
    localStorage.removeItem('guestLocation');
    set({ vendor: user, isAuthenticated: true });
  },

  setVendor: (vendor) => {
    if (!get().isAuthenticated && vendor?.location) {
      localStorage.setItem('guestLocation', JSON.stringify({ 
        location: vendor.location, 
        latitude: vendor.latitude, 
        longitude: vendor.longitude, 
        lat: vendor.lat, 
        lng: vendor.lng 
      }));
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
