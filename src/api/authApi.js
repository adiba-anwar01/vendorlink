import api from './api';

export const registerVendor = (data) => api.post('/auth/register', data);
export const loginVendor    = (data) => api.post('/auth/login',    data);
