import api from '@/api/api';

export const registerVendor = (data) => api.post('/auth/register', data);
export const loginVendor = (data) => api.post('/auth/login', data);
export const updateVendorLocation = (data) => api.post('/auth/update-location', data);
