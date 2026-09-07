import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
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
import { mergeMessages } from '../../utils/chatMessages';

export default function ChatScreen({ route, navigation }) {
  const { conversationId: initialId, productId, productTitle, participantName, sellerName } = route.params || {};
  const { user } = useAuth();
  const { refresh } = useChat();
  const focused = useIsFocused();
  const [appState, setAppState] = useState(AppState.currentState);
  const [id, setId] = useState(initialId);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
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
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  active.current = focused && appState === 'active';
  const updateMessages = useCallback((incoming) => {
    rows.current = mergeMessages(rows.current, incoming);
    setMessages(rows.current);
  }, []);

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
        updateMessages(incoming);
        setError(null);
      } catch (failure) { if (!cancelled) setError(failure.message); }
      finally { busy = false; if (!cancelled) setLoading(false); }
    };
    sync();
    const timer = setInterval(sync, 4000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [id, focused, appState, updateMessages, attempt]);

  const acknowledgeVisible = useCallback(async () => {
    if (!id || !active.current) return;
    const ids = visible.current.filter((item) => item.senderId !== user.id && !item.readAt && !item.status && !readPending.current.has(item.id) && !acknowledged.current.has(item.id)).map((item) => item.id).slice(0, 100);
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
    if (!id || !text || sendLock.current) return;
    sendLock.current = true;
    setSending(true);
    const pending = retry || { id: createId('pending'), clientId: createId('message'), senderId: user.id, text, createdAt: new Date().toISOString() };
    updateMessages([{ ...pending, status: 'sending' }]);
    if (!retry) setMessage('');
    list.current?.scrollToOffset({ offset: 0, animated: true });
    try {
      const saved = await chatService.send(id, text, pending.clientId);
      if (alive.current) { updateMessages([saved]); refresh(); setError(null); }
    } catch (failure) {
      if (alive.current) {
        // A poll may already have confirmed a send whose response was lost.
        const confirmed = rows.current.some((item) => item.clientId === pending.clientId && item.senderId === user.id && !item.status);
        if (!confirmed) updateMessages([{ ...pending, status: 'failed' }]);
        setError(failure.message);
      }
    } finally { sendLock.current = false; if (alive.current) setSending(false); }
  };
  const loadOlder = async () => {
    if (!cursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const result = await chatService.messages(id, cursor);
      if (alive.current) { updateMessages(result.items); setCursor(result.nextCursor); }
    } catch (failure) { if (alive.current) setError(failure.message); }
    finally { if (alive.current) setLoadingOlder(false); }
  };

  return <Screen contentContainerStyle={styles.page}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90} style={styles.keyboard}>
      <View style={styles.context}>
        {productTitle ? <Text style={sharedStyles.sectionTitle}>{productTitle}</Text> : null}
        <Text style={sharedStyles.helperNote}>Conversa com {participantName || sellerName || 'utilizador'}</Text>
      </View>
      {error ? <View><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Button title="Tentar novamente" variant="secondary" onPress={() => setAttempt((value) => value + 1)} /></View> : null}
      <FlatList ref={list} inverted data={[...messages].reverse()} keyExtractor={(item) => `${item.senderId}:${item.clientId}`}
        contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled"
        onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={viewabilityConfig}
        ListEmptyComponent={<Text style={sharedStyles.helperNote}>{loading ? 'A carregar mensagens…' : 'Ainda não existem mensagens. Escreve para iniciar a conversa.'}</Text>}
        ListFooterComponent={cursor ? <Button title="Mensagens anteriores" variant="secondary" loading={loadingOlder} onPress={loadOlder} /> : null}
        renderItem={({ item }) => <View>
          <MessageBubble message={item.text} own={item.senderId === user.id} />
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}{item.status === 'sending' ? ' · A enviar…' : ''}</Text>
          {item.status === 'failed' ? <Button title="Reenviar mensagem" variant="secondary" disabled={sending} onPress={() => send(item)} /> : null}
        </View>}
      />
      <View style={styles.composer}>
        <Input placeholder="Escreve uma mensagem..." value={message} onChangeText={setMessage} maxLength={2000} returnKeyType="send" blurOnSubmit={false} onSubmitEditing={() => send()} style={styles.messageInput} />
        <Button title="Enviar" loading={sending} disabled={!id || !message.trim() || sending} onPress={() => send()} style={styles.sendButton} />
      </View>
    </KeyboardAvoidingView>
  </Screen>;
}
const styles = StyleSheet.create({
  page: { paddingTop: spacing.md }, keyboard: { flex: 1, gap: spacing.md },
  context: { padding: spacing.md, borderRadius: 16, backgroundColor: colors.cream, gap: spacing.xs },
  messages: { flexGrow: 1, gap: spacing.sm, paddingVertical: spacing.sm },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  messageInput: { flex: 1 }, sendButton: { paddingHorizontal: spacing.md },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 3 }, error: { color: colors.error }
});
