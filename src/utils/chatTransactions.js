export const activeTransactionStatuses = ['pending', 'accepted', 'buyer_confirmed', 'seller_confirmed', 'completed'];
export const purchaseStatusLabels = {
  pending: 'Pendente', accepted: 'A confirmar pelo comprador', buyer_confirmed: 'A confirmar pelo vendedor',
  seller_confirmed: 'Em curso', declined: 'Recusada', completed: 'Avaliação pendente', reviewed: 'Finalizada', cancelled: 'Cancelada'
};

// Late polls cannot overwrite a mutation response with an older state.
export function mergeTransactions(current, incoming) {
  const rows = new Map(current.map(row => [row.id, row]));
  for (const row of incoming) {
    if (!rows.has(row.id) || (row.revision || 0) >= (rows.get(row.id).revision || 0)) rows.set(row.id, row);
  }
  return [...rows.values()];
}

// Only persisted milestones belong in the history. Legacy purchases may have
// completed before agreement confirmations existed; don't invent those steps.
export function purchaseHistory(transaction) {
  return [
    ['proposal', transaction.createdAt],
    ['accepted', transaction.acceptedAt],
    ['buyer_confirmed', transaction.buyerAgreementConfirmedAt],
    ['seller_confirmed', transaction.sellerAgreementConfirmedAt],
    ['declined', transaction.declinedAt],
    ['completed', transaction.completedAt || transaction.buyerConfirmedAt],
    ['reviewed', transaction.reviewedAt]
  ].filter(([, createdAt]) => createdAt).map(([stage, createdAt]) => ({ stage, createdAt }));
}

// One stable card per purchase, placed at its latest milestone. Number against
// the full purchase history, independent of message pagination and poll order.
export function purchaseTimeline(messages, transactions, hasOlderMessages) {
  const sorted = [...transactions].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const events = sorted.map((transaction, index) => {
    const history = purchaseHistory(transaction);
    return { id: `transaction:${transaction.id}`, kind: 'transaction', transaction, history,
      purchaseNumber: index + 1, isLatest: index === sorted.length - 1,
      createdAt: history.at(-1).createdAt };
  });
  const oldest = messages.filter(row => !row.status).map(row => row.createdAt).sort()[0];
  // Keep the latest purchase reachable even if many messages followed it.
  return [...messages, ...events.filter(row => row.isLatest || !hasOlderMessages || !oldest || row.createdAt >= oldest)]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

export const reputationLabel = reputation => reputation?.count
  ? `★ ${reputation.average.toFixed(1).replace('.', ',')} · ${reputation.count} ${reputation.count === 1 ? 'avaliação' : 'avaliações'}`
  : 'Ainda sem avaliações como vendedor';
