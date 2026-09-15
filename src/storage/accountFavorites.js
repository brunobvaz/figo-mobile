// Keep writes ordered per account, including quick logout/login cycles.
export function createAccountFavoritesStore(read, write, prefix, remove = key => write(key, [])) {
  const writes = new Map();
  const deleted = new Set();
  const keyFor = userId => `${prefix}:${userId}`;
  return {
    async clear(userId) {
      if (!userId) return;
      deleted.add(userId);
      const key = keyFor(userId);
      const pending = (writes.get(key) || Promise.resolve()).catch(() => {}).then(() => remove(key));
      writes.set(key, pending);
      return pending;
    },
    async load(userId) {
      if (!userId || deleted.has(userId)) return [];
      const key = keyFor(userId);
      await writes.get(key);
      const ids = await read(key, []);
      return Array.isArray(ids) ? [...new Set(ids.filter(id => typeof id === 'string'))] : [];
    },
    save(userId, ids) {
      if (!userId || deleted.has(userId)) return Promise.resolve();
      const key = keyFor(userId);
      const snapshot = [...ids];
      const pending = (writes.get(key) || Promise.resolve()).catch(() => {}).then(() => write(key, snapshot));
      writes.set(key, pending);
      return pending;
    }
  };
}
