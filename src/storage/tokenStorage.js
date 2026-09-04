import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'daterra.accessToken';
const REFRESH_TOKEN_KEY = 'daterra.refreshToken';

export const tokenStorage = {
  async save({ accessToken, refreshToken }) {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
    ]);
  },
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  async clear() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
    ]);
  }
};
