import api from './api';

export const placeOrder = (productId, orderDetails) => api.post(`/orders/${productId}`, orderDetails);
export const getMyOrders = () => api.get('/orders/my/orders');
export const getSellerOrders = () => api.get('/orders/seller/orders');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
