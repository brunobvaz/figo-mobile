import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from '../services/chatService';
import { createId } from '../utils/helpers';

export default function useChatPurchase({ conversationId, userId, transactions, onSaved, onRefresh }) {
  const [sheet, setSheet] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const lock = useRef(false);
  const alive = useRef(true);
  const storageKey = `chat-proposal:${userId}:${conversationId}`;
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (!sheet || busy) return;
    const saved = transactions.find(item => sheet.type === 'propose' ? item.clientId === sheet.clientId : item.id === sheet.purchase.id);
    if (saved && (sheet.type === 'propose' || (sheet.type === 'confirm-buyer' && saved.buyerAgreementConfirmedAt)
      || (sheet.type === 'confirm-seller' && saved.sellerAgreementConfirmedAt) || (sheet.type === 'complete' && saved.completedAt) || (sheet.type === 'review' && saved.reviewedAt))) {
      if (sheet.type === 'propose') AsyncStorage.removeItem(storageKey).catch(() => {});
      setSheet(null); setError(null);
    }
  }, [transactions, sheet, busy, storageKey]);

  const openProposal = async (previousPurchase) => {
    if (lock.current || !conversationId) return;
    lock.current = true; setBusy('prepare'); setError(null);
    try {
      // Refresh before quoting; the server checks the price again on submission.
      const [context, stored] = await Promise.all([chatService.detail(conversationId), AsyncStorage.getItem(storageKey)]);
      let pending = stored ? JSON.parse(stored) : null;
      const recovered = pending && context.transactions.find(item => item.clientId === pending.input.clientId);
      if (recovered) {
        await AsyncStorage.removeItem(storageKey); pending = null;
      }
      if (!alive.current) return;
      onRefresh();
      if (recovered && !context.canPropose) { onSaved(recovered); return; }
      if (!context.canPropose) throw new Error('Não é possível criar uma nova proposta. Atualiza a conversa.');
      setSheet({ type: 'propose', product: pending?.product || context.purchaseProduct,
        repeat: previousPurchase?.status === 'reviewed',
        quantity: pending?.input.quantity || previousPurchase?.quantity || 1,
        clientId: pending?.input.clientId || createId('proposal'), uncertain: Boolean(pending) });
    } catch (failure) { if (alive.current) setError(failure.message); }
    finally { lock.current = false; if (alive.current) setBusy(null); }
  };

  const execute = async (action, purchase, input) => {
    if (lock.current) return;
    lock.current = true; setBusy(`${purchase?.id || 'new'}:${action}`); setError(null);
    try {
      if (action === 'propose') await AsyncStorage.setItem(storageKey, JSON.stringify({ input, product: sheet.product }));
      const saved = action === 'propose' ? await chatService.propose(conversationId, input)
        : await chatService.purchaseAction(conversationId, purchase.id, action, input);
      if (action === 'propose') await AsyncStorage.removeItem(storageKey).catch(() => {});
      if (alive.current) { onSaved(saved); setSheet(null); }
    } catch (failure) {
      const rejected = failure.status >= 400 && failure.status < 500;
      // A 5xx can arrive after the database committed. Keep the exact request
      // across retries/restarts until the server has definitively rejected it.
      if (action === 'propose' && rejected) await AsyncStorage.removeItem(storageKey).catch(() => {});
      if (alive.current) {
        setError(failure.message);
        if (action === 'propose') setSheet(current => current ? { ...current,
          ...(failure.code === 'PRODUCT_PRICE_CHANGED' ? { product: failure.details } : {}),
          clientId: rejected ? createId('proposal') : current.clientId,
          uncertain: !rejected } : current);
      }
    } finally {
      lock.current = false;
      if (alive.current) { setBusy(null); onRefresh(); }
    }
  };
  const onAction = (action, purchase) => {
    if (lock.current) return;
    setError(null);
    if (['confirm-buyer', 'confirm-seller', 'complete', 'review'].includes(action)) setSheet({ type: action, purchase, rating: 0, comment: '' });
    else execute(action, purchase);
  };
  const submit = () => {
    if (!sheet || lock.current) return;
    if (sheet.type === 'propose') return execute('propose', null, { quantity: sheet.quantity, expectedUnitPrice: sheet.product.price, clientId: sheet.clientId });
    if (sheet.type === 'review' && !sheet.rating) return;
    return execute(sheet.type, sheet.purchase, sheet.type === 'review'
      ? { rating: sheet.rating, comment: sheet.comment.trim(), clientId: `review-${sheet.purchase.id}-${userId}` } : {});
  };
  return { sheet, busy, error, openProposal, onAction, submit,
    change: changes => { if (!lock.current && !sheet?.uncertain) setSheet(current => ({ ...current, ...changes })); },
    close: () => { if (!lock.current) { setSheet(null); setError(null); } } };
}
