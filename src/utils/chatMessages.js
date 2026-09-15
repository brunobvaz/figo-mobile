// The same clientId is retained across retries; only that sender's pending row is replaced.
export const mergeMessages = (current, incoming) => {
  const rows = new Map(current.map((item) => [`${item.senderId}:${item.clientId}`, item]));
  incoming.forEach((item) => rows.set(`${item.senderId}:${item.clientId}`, item));
  return [...rows.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
};

// Apply to the complete in-memory history after merging any page or late reply.
export const redactRemovedParticipant = (rows, participant) => {
  if (!['deleted', 'deletion_pending'].includes(participant?.status)) return rows;
  return rows.map(row => row.senderId === participant.id
    ? { ...row, text: 'Mensagem removida', removedAt: row.removedAt || true } : row);
};
