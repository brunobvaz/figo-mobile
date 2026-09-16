import { api } from './api';
import config from '../config/config';

const base = config.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
const avatarUrl = filename => filename ? `${base}/uploads/avatars/${encodeURIComponent(filename)}` : null;
export const orderService = {
  summary: () => api.get('/users/me/commerce'),
  list: (role = 'buyer', page = 1) => api.get(`/users/me/transactions?role=${role}&page=${page}&limit=20`),
  async reviews(id, page = 1) {
    const result = await api.get(`/users/${id}/reviews?page=${page}&limit=20`);
    return { ...result, items: result.items.map(review => ({ ...review, authorAvatar: avatarUrl(review.authorAvatarFilename) })) };
  },
  async profile(id) {
    const profile = await api.get(`/users/${id}/profile`);
    return { ...profile, avatar: avatarUrl(profile.avatarFilename) };
  }
};
