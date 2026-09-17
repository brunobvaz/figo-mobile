export function visibleChatReceipts(viewableItems, timeline, userId, pending, acknowledged) {
  const messageIds = new Set(), transactionEventIds = new Set();
  const unseen = (kind, id) => !pending.has(`${kind}:${id}`) && !acknowledged.has(`${kind}:${id}`);
  for (const token of viewableItems) {
    const item = timeline[token.index];
    // A card can move when its purchase advances. Wait for its new visible
    // position instead of acknowledging a card that has moved off screen.
    if (!token.isViewable || !item || item.id !== token.item.id) continue;
    if (item.kind === 'transaction') {
      for (const id of item.transaction.unreadEventIds || []) {
        if (unseen('transaction', id) && transactionEventIds.size < 100) transactionEventIds.add(id);
      }
    } else if (item.senderId !== userId && !item.readAt && !item.status && unseen('message', item.id) && messageIds.size < 100) {
      messageIds.add(item.id);
    }
  }
  return {
    messageIds: [...messageIds], transactionEventIds: [...transactionEventIds],
    keys: [...messageIds].map(id => `message:${id}`).concat([...transactionEventIds].map(id => `transaction:${id}`))
  };
}
