import { File as ExpoFile } from 'expo-file-system';
import { api } from './api';
import { tokenStorage } from '../storage/tokenStorage';
import config from '../config/config';

const serverBaseUrl = config.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
const normalizeUser = (user) => user ? {
  ...user,
  avatar: user.avatarFilename ? `${serverBaseUrl}/uploads/avatars/${encodeURIComponent(user.avatarFilename)}` : user.avatar
} : user;
const saveSession = async (session) => { await tokenStorage.save(session); return { ...session, user: normalizeUser(session.user) }; };

export const authService = {
  login: async (credentials) => saveSession(await api.post('/auth/login', credentials)),
  register: (data) => api.post('/auth/register', data),
  resendRegistrationOtp: ({ challengeId }) => api.post('/auth/resend-email-verification', { challengeId }),
  verifyRegistrationOtp: async (payload) => saveSession(await api.post('/auth/verify-email', payload)),
  requestPasswordReset: ({ email }) => api.post('/auth/forgot-password', { email }),
  resetPassword: ({ token, newPassword }) => api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (payload) => api.post('/auth/change-password', payload),
  getCurrentUser: async () => normalizeUser(await api.get('/auth/me')),
  async restoreSession() {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return null;
    const session = await api.post('/auth/refresh', { refreshToken });
    await tokenStorage.save(session);
    return normalizeUser(await api.get('/auth/me'));
  },
  async logout() {
    const refreshToken = await tokenStorage.getRefreshToken();
    try { if (refreshToken) await api.post('/auth/logout', { refreshToken }); }
    finally { await tokenStorage.clear(); }
  },
  async logoutAll() {
    try { await api.post('/auth/logout-all', {}); }
    finally { await tokenStorage.clear(); }
  },
  updateProfile: async (changes) => normalizeUser(await api.patch('/users/me', changes)),
  async updateAvatar(asset) {
    const form = new FormData();
    form.append('avatar', asset.file || new ExpoFile(asset.uri));
    return normalizeUser(await api.upload('/users/me/avatar', form));
  },
  enableSeller: async () => normalizeUser(await api.post('/users/me/enable-seller', {})),
};
