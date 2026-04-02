import api from './api';

export const getMyConversations = () => api.get('/conversations/my');
export const startConversation = (productId) => api.post(`/conversations/${productId}`);
export const getMessages = (convId) => api.get(`/messages/${convId}`);
export const sendMessage = (convId, data) => api.post(`/messages/${convId}`, data);
export const acceptConversation = (convId) => api.put(`/conversations/accept/${convId}`);
export const rejectConversation = (convId) => api.put(`/conversations/reject/${convId}`);
