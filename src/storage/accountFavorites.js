// Keep writes ordered per account, including quick logout/login cycles.
export function createAccountFavoritesStore(read, write, prefix) {
  const writes = new Map();
  const keyFor = userId => `${prefix}:${userId}`;
  return {
    async load(userId) {
      if (!userId) return [];
      const key = keyFor(userId);
      await writes.get(key);
      const ids = await read(key, []);
      return Array.isArray(ids) ? [...new Set(ids.filter(id => typeof id === 'string'))] : [];
    },
    save(userId, ids) {
      if (!userId) return Promise.resolve();
      const key = keyFor(userId);
      const snapshot = [...ids];
      const pending = (writes.get(key) || Promise.resolve()).catch(() => {}).then(() => write(key, snapshot));
      writes.set(key, pending);
      return pending;
    }
  };
}
