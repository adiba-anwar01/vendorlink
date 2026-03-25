import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vendorlink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor – global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vendorlink_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ─── Products ────────────────────────────────────────────────────────────────

export const productAPI = {
  getAll:    ()           => api.get('/vendor/products'),
  getById:   (id)         => api.get(`/vendor/products/${id}`),
  create:    (data)       => api.post('/vendor/products', data),
  update:    (id, data)   => api.put(`/vendor/products/${id}`, data),
  delete:    (id)         => api.delete(`/vendor/products/${id}`),
  markSold:  (id)         => api.patch(`/vendor/products/${id}/sold`),
};

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversationAPI = {
  getAll:     ()           => api.get('/vendor/conversations'),
  getById:    (id)         => api.get(`/vendor/conversations/${id}`),
  sendMessage:(id, text)   => api.post(`/vendor/conversations/${id}/messages`, { message_text: text }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orderAPI = {
  getAll:      ()               => api.get('/vendor/orders'),
  getById:     (id)             => api.get(`/vendor/orders/${id}`),
  updateStatus:(id, status)     => api.patch(`/vendor/orders/${id}/status`, { status }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsAPI = {
  getSummary: () => api.get('/vendor/analytics/summary'),
  getMonthly: () => api.get('/vendor/analytics/monthly'),
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const profileAPI = {
  get:            ()        => api.get('/vendor/profile'),
  update:         (data)    => api.put('/vendor/profile', data),
  changePassword: (data)    => api.post('/vendor/profile/password', data),
};

export default api;
