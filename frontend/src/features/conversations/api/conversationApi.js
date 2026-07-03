import api from '@/api/api';

export const getMyConversations = () => api.get('/conversations/myconvo');
export const startConversation = (productId) => api.post(`/conversations/${productId}`);
export const getMessages = (convId) => api.get(`/messages/${convId}`);
export const sendMessage = (convId, data) => api.post(`/messages/${convId}`, data);
export const acceptConversation = (convId) => api.put(`/conversations/accept/${convId}`);
export const deleteConversation = (convId) => api.delete(`/conversations/${convId}`);
