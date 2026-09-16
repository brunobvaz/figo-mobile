import LoadingScreen from '../../components/common/LoadingScreen';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductContextCard from '../../components/chat/ProductContextCard';
import useConversationProduct from '../../hooks/useConversationProduct';
import { ROUTES } from '../../navigation/routes';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import MessageBubble from '../../components/common/MessageBubble';
import Screen from '../../components/layout/Screen';
import sharedStyles from '../../theme/SharedStyles';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import useAuth from '../../hooks/useAuth';
import { useChat } from '../../context/ChatContext';
import { chatService } from '../../services/chatService';
import { createId } from '../../utils/helpers';
import { mergeMessages, redactRemovedParticipant } from '../../utils/chatMessages';
import { activeTransactionStatuses, mergeTransactions, purchaseTimeline, reputationLabel } from '../../utils/chatTransactions';
import useChatPurchase from '../../hooks/useChatPurchase';
import TransactionCard from '../../components/chat/TransactionCard';
import PurchaseSheet from '../../components/chat/PurchaseSheet';

export default function ChatScreen({ route, navigation }) {
  const { conversationId: initialId, productId, productTitle } = route.params || {};
  const { user } = useAuth();
  const { refresh } = useChat();
  const focused = useIsFocused();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState(AppState.currentState);
  const [id, setId] = useState(initialId);
  const contextProduct = useConversationProduct({ conversationId: id, productId, productTitle, focused });
  const [message, setMessage] = useState('');
  const [availability, setAvailability] = useState({ canSend: false });
  const availabilityRef = useRef({ canSend: false });
  const [messages, setMessages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expandedPurchases, setExpandedPurchases] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const alive = useRef(true);
  const rows = useRef([]);
  const active = useRef(false);
  const sendLock = useRef(false);
  const visible = useRef([]);
  const readPending = useRef(new Set());
  const acknowledged = useRef(new Set());
  const list = useRef(null);
  const nearLatest = useRef(true);
  const scrollToLatest = useCallback(() => {
    nearLatest.current = true;
    // The list is inverted: offset zero is the newest message, above the composer.
    list.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);
  const keepLatestVisible = useCallback(() => {
    if (nearLatest.current) list.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  active.current = focused && appState === 'active';
  const updateMessages = useCallback((incoming) => {
    rows.current = redactRemovedParticipant(mergeMessages(rows.current, incoming), availabilityRef.current.participant);
    setMessages(rows.current);
  }, []);

  const updateAvailability = useCallback(page => {
    if (['deleted', 'deletion_pending'].includes(availabilityRef.current.participant?.status) && !['deleted', 'deletion_pending'].includes(page.participant?.status)) return;
    availabilityRef.current = page;
    setAvailability(page);
    setTransactions(current => mergeTransactions(current, page.transactions || []));
    if (page.participant?.name) navigation.setOptions({ title: page.participant.name });
    if (['deleted', 'deletion_pending'].includes(page.participant?.status)) {
      // Include older pages already in memory, not only this poll's recent page.
      rows.current = redactRemovedParticipant(rows.current, page.participant);
      setMessages(rows.current);
    }
  }, [navigation]);

  const purchase = useChatPurchase({ conversationId: id, userId: user.id, transactions,
    onSaved: saved => { setTransactions(current => mergeTransactions(current, [saved])); scrollToLatest(); refresh(); },
    onRefresh: () => { setAttempt(value => value + 1); refresh(); } });
  const timeline = useMemo(() => purchaseTimeline(messages, transactions, Boolean(cursor)).reverse(), [messages, transactions, cursor]);
  const buyerName = availability.buyerId === user.id ? user.name : availability.participant?.name || 'o comprador';
  const sellerName = availability.sellerId === user.id ? user.name : availability.participant?.name || 'o vendedor';
  const canPropose = availability.canPropose && !transactions.some(item => activeTransactionStatuses.includes(item.status));
  const repeatPurchase = canPropose && availability.canSend
    ? timeline.find(item => item.kind === 'transaction' && item.isLatest && item.transaction.status === 'reviewed' && item.transaction.buyerId === user.id)
    : null;
  const togglePurchase = purchaseId => {
    // Opening an older card must not jump back to the newest message.
    nearLatest.current = false;
    setExpandedPurchases(current => ({ ...current, [purchaseId]: !current[purchaseId] }));
  };

  useEffect(() => {
    alive.current = true;
    const listener = AppState.addEventListener('change', setAppState);
    return () => { alive.current = false; listener.remove(); };
  }, []);

  useEffect(() => {
    if (id) return;
    let cancelled = false;
    setError(null);
    setLoading(true);
    chatService.open(productId).then((conversation) => {
      if (!cancelled) { setId(conversation.id); navigation.setParams({ conversationId: conversation.id }); refresh(); }
    }).catch((failure) => { if (!cancelled) { setError(failure.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id, productId, refresh, attempt, navigation]);

  useEffect(() => {
    if (!id || !focused || appState !== 'active') return;
    let cancelled = false;
    let busy = false;
    const sync = async () => {
      if (busy) return;
      busy = true;
      try {
        let page = await chatService.messages(id);
        const newestKnown = rows.current.filter((item) => !item.status).at(-1)?.id;
        const incoming = [...page.items];
        const firstCursor = page.nextCursor;
        // Catch up across multiple pages after a long absence, without gaps.
        while (!cancelled && newestKnown && page.nextCursor && page.items[0]?.id > newestKnown) {
          page = await chatService.messages(id, page.nextCursor);
          incoming.push(...page.items);
        }
        if (cancelled) return;
        if (!newestKnown) setCursor(firstCursor);
        updateAvailability(page);
        updateMessages(incoming);
        setError(null);
      } catch (failure) { if (!cancelled) setError(failure.message); }
      finally { busy = false; if (!cancelled) setLoading(false); }
    };
    sync();
    const timer = setInterval(sync, 4000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [id, focused, appState, updateMessages, updateAvailability, attempt]);

  const acknowledgeVisible = useCallback(async () => {
    if (!id || !active.current) return;
    const ids = visible.current.filter((item) => item.kind !== 'transaction' && item.senderId !== user.id && !item.readAt && !item.status && !readPending.current.has(item.id) && !acknowledged.current.has(item.id)).map((item) => item.id).slice(0, 100);
    if (!ids.length) return;
    ids.forEach((key) => readPending.current.add(key));
    try {
      await chatService.read(id, ids);
      ids.forEach((key) => acknowledged.current.add(key));
      if (alive.current) refresh();
    } catch { /* Retry on the next poll while the messages remain visible. */ }
    finally { ids.forEach((key) => readPending.current.delete(key)); }
  }, [id, user.id, refresh]);
  const acknowledgeRef = useRef(acknowledgeVisible);
  acknowledgeRef.current = acknowledgeVisible;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    visible.current = viewableItems.map(({ item }) => item);
    acknowledgeRef.current();
  }).current;
  useEffect(() => { acknowledgeVisible(); }, [messages, focused, appState, acknowledgeVisible]);

  const send = async (retry) => {
    const text = retry?.text || message.trim();
    if (!id || !text || sendLock.current || !availabilityRef.current.canSend) return;
    sendLock.current = true;
    setSending(true);
    const pending = retry || { id: createId('pending'), clientId: createId('message'), senderId: user.id, text, createdAt: new Date().toISOString() };
    updateMessages([{ ...pending, status: 'sending' }]);
    if (!retry) setMessage('');
    scrollToLatest();
    try {
      const saved = await chatService.send(id, text, pending.clientId);
      if (alive.current) { updateMessages([saved]); refresh(); setError(null); }
    } catch (failure) {
      if (alive.current) {
        // A poll may already have confirmed a send whose response was lost.
        const confirmed = rows.current.some((item) => item.clientId === pending.clientId && item.senderId === user.id && !item.status);
        if (!confirmed) updateMessages([{ ...pending, status: 'failed' }]);
        setError(failure.message);
        if (failure.code === 'CONVERSATION_UNAVAILABLE') {
          availabilityRef.current = { canSend: false, unavailableReason: failure.message };
          setAvailability(availabilityRef.current); setAttempt(value => value + 1);
        }
      }
    } finally { sendLock.current = false; if (alive.current) setSending(false); }
  };
  const loadOlder = async () => {
    if (!cursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const result = await chatService.messages(id, cursor);
      if (alive.current) { updateAvailability(result); updateMessages(result.items); setCursor(result.nextCursor); }
    } catch (failure) { if (alive.current) setError(failure.message); }
    finally { if (alive.current) setLoadingOlder(false); }
  };

  // Android already resizes the window (softwareKeyboardLayoutMode: resize).
  // On iOS resize the whole conversation, including the composer, below the native header.
  return <LoadingScreen loading={focused && (loading || contextProduct.loading)} message="A carregar conversa…"><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={headerHeight} style={styles.keyboard}>
    <Screen safeAreaEdges={['left', 'right']} contentContainerStyle={[styles.page, { paddingBottom: Math.max(spacing.sm, insets.bottom) }]}>
      <ProductContextCard product={availability.participant?.status && availability.participant.status !== 'active' ? null : contextProduct.product} title={availability.productTitle || contextProduct.title} loading={contextProduct.loading}
        onPress={() => navigation.push(ROUTES.PRODUCT_DETAILS, { productId: contextProduct.productId })} />
      {canPropose && !repeatPurchase ? <Button title="Propor compra" loading={purchase.busy === 'prepare'} disabled={Boolean(purchase.busy) || loading || !availability.canSend} onPress={() => purchase.openProposal()} /> : null}
      {availability.buyerId === user.id && availability.sellerReputation ? <Text style={styles.reputation}>{sellerName} · {reputationLabel(availability.sellerReputation)}</Text> : null}
      {purchase.error && !purchase.sheet ? <Text accessibilityRole="alert" style={styles.error}>{purchase.error}</Text> : null}
      {error ? <View><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Button title="Tentar novamente" variant="secondary" onPress={() => setAttempt((value) => value + 1)} /></View> : null}
      <FlatList ref={list} inverted data={timeline} keyExtractor={(item) => item.kind === 'transaction' ? item.id : `${item.senderId}:${item.clientId}`}
        style={styles.list}
        contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets={false}
        onLayout={keepLatestVisible} onContentSizeChange={keepLatestVisible}
        onScroll={({ nativeEvent }) => { nearLatest.current = nativeEvent.contentOffset.y <= spacing.xl; }} scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={viewabilityConfig}
        ListEmptyComponent={<Text style={sharedStyles.helperNote}>{loading ? 'A carregar mensagens…' : availability.canSend ? 'Ainda não existem mensagens. Escreve para iniciar a conversa.' : 'Ainda não existem mensagens.'}</Text>}
        ListFooterComponent={cursor ? <Button title="Mensagens anteriores" variant="secondary" loading={loadingOlder} onPress={loadOlder} /> : null}
        renderItem={({ item }) => item.kind === 'transaction'
          ? <TransactionCard event={item} userId={user.id} buyerName={buyerName} sellerName={sellerName} busy={purchase.busy}
            canInteract={availability.canSend} onAction={purchase.onAction}
            expanded={Boolean(expandedPurchases[item.transaction.id])} onToggle={() => togglePurchase(item.transaction.id)}
            canRepeat={repeatPurchase?.id === item.id} onRepeat={purchase.openProposal} /> : <View>
          <MessageBubble message={item.text} own={item.senderId === user.id} />
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}{item.status === 'sending' ? ' · A enviar…' : ''}</Text>
          {item.status === 'failed' ? <Button title="Reenviar mensagem" variant="secondary" disabled={sending || !availability.canSend} onPress={() => send(item)} /> : null}
        </View>}
      />
      {availability.canSend ? <View style={styles.composer}>
        <Input placeholder="Escreve uma mensagem..." value={message} onChangeText={setMessage} onFocus={scrollToLatest} maxLength={2000} returnKeyType="send" blurOnSubmit={false} onSubmitEditing={() => send()} style={styles.messageInput} />
        <Button title="Enviar" loading={sending} disabled={!id || !message.trim() || sending} onPress={() => send()} style={styles.sendButton} />
      </View> : <Text accessibilityRole="alert" style={sharedStyles.helperNote}>{availability.unavailableReason || 'A confirmar a disponibilidade da conversa…'}</Text>}
    </Screen>
    <PurchaseSheet sheet={purchase.sheet} sellerName={sellerName} busy={Boolean(purchase.busy)} error={purchase.error}
      onChange={purchase.change} onClose={purchase.close} onSubmit={purchase.submit} />
  </KeyboardAvoidingView></LoadingScreen>;
}
const styles = StyleSheet.create({
  page: { flex: 1, minHeight: 0, paddingTop: spacing.md, gap: spacing.md },
  keyboard: { flex: 1, backgroundColor: colors.background },
  list: { flex: 1, minHeight: 0 },
  messages: { flexGrow: 1, gap: spacing.sm, paddingVertical: spacing.sm },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  messageInput: { flex: 1 }, sendButton: { paddingHorizontal: spacing.md },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 3 }, error: { color: colors.error },
  reputation: { color: colors.primaryDarkFigo, fontSize: 12 }
});
