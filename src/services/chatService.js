import { api } from './api';
import config from '../config/config';
const base = config.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
export const chatService = {
  async list(page = 1) {
    const result = await api.get(`/conversations?page=${page}&limit=50`);
    return { ...result, items: result.items.map((item) => ({ ...item, participant: { ...item.participant, avatar: item.participant.avatarFilename ? `${base}/uploads/avatars/${encodeURIComponent(item.participant.avatarFilename)}` : null } })) };
  },
  detail: (id) => api.get(`/conversations/${id}`),
  open: (productId) => api.post('/conversations', { productId }),
  messages: (id, before) => api.get(`/conversations/${id}/messages?limit=50${before ? `&before=${encodeURIComponent(before)}` : ''}`),
  send: (id, text, clientId) => api.post(`/conversations/${id}/messages`, { text, clientId }),
  read: (id, messageIds) => api.patch(`/conversations/${id}/read`, { messageIds })
};
