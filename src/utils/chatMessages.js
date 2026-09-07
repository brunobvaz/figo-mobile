// The same clientId is retained across retries; only that sender's pending row is replaced.
export const mergeMessages = (current, incoming) => {
  const rows = new Map(current.map((item) => [`${item.senderId}:${item.clientId}`, item]));
  incoming.forEach((item) => rows.set(`${item.senderId}:${item.clientId}`, item));
  return [...rows.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
};
