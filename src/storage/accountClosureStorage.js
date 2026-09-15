import * as SecureStore from 'expo-secure-store';
const key = 'daterra.accountClosure';
export const accountClosureStorage = {
  async read() { const value = await SecureStore.getItemAsync(key); return value ? JSON.parse(value) : null; },
  save: value => SecureStore.setItemAsync(key, JSON.stringify(value)),
  clear: () => SecureStore.deleteItemAsync(key)
};
