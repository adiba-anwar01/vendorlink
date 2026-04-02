import api from './api';

// POST /api/orders/:productId  →  Buyer places an order for a product
export const placeOrder = (productId, orderDetails) => api.post(`/orders/${productId}`, orderDetails);

// GET /api/orders/my/orders    →  Buyer fetches all their own orders
export const getMyOrders = () => api.get('/orders/my/orders');

// GET /api/orders/seller/orders →  Vendor fetches all orders for their products
export const getSellerOrders = () => api.get('/orders/seller/orders');

// GET /api/orders/:id          →  Fetch a single order by ID
export const getOrderById = (id) => api.get(`/orders/${id}`);

// PUT /api/orders/:id/status   →  Vendor updates the status of an order
export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });
