import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../components/layout/Screen';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { orderService } from '../../services/orderService';
import { purchaseStatusLabels } from '../../utils/chatTransactions';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import shadows from '../../theme/shadows';
import spacing from '../../theme/spacing';
import { formatDate, formatPrice } from '../../utils/formatters';

export default function OrdersScreen({ route, navigation }) {
  const role = route.params?.role === 'seller' ? 'seller' : 'buyer';
  const selling = role === 'seller';
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const generation = useRef(0);
  const retryPage = useRef(1);
  const lock = useRef(false);
  const load = useCallback(async (nextPage, version) => {
    if (lock.current) return;
    lock.current = true; retryPage.current = nextPage; setBusy(true); setError(null);
    try {
      const result = await orderService.list(role, nextPage);
      if (generation.current !== version) return;
      setItems(current => nextPage === 1 ? result.items : [...new Map([...current, ...result.items].map(item => [item.id, item])).values()]);
      setPage(nextPage); setTotal(result.pagination.total);
    } catch (failure) { if (generation.current === version) setError(failure.message); }
    finally { if (generation.current === version) { lock.current = false; setLoading(false); setBusy(false); } }
  }, [role]);
  useFocusEffect(useCallback(() => {
    const version = ++generation.current;
    lock.current = false; setLoading(true); setItems([]); setPage(1); setTotal(0);
    load(1, version);
    return () => { generation.current += 1; };
  }, [load]));
  const openChat = item => navigation.navigate(ROUTES.CHAT, { conversationId: item.conversationId, productId: item.productId, productTitle: item.productTitle, participantName: item.participantName });
  return <Screen maxWidth={800} contentContainerStyle={styles.page}>
    <Text style={styles.subtitle}>{selling ? 'Acompanha as tuas vendas e abre o chat para continuar.' : 'Acompanha as tuas encomendas e abre o chat para continuar.'}</Text>
    {error ? <View style={styles.errorBox}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Button title="Tentar novamente" variant="secondary" onPress={() => load(retryPage.current, generation.current)} disabled={busy} /></View> : null}
    {loading ? <Loading /> : <FlatList data={items} keyExtractor={item => item.id} style={styles.list}
      contentContainerStyle={{ gap: spacing.md, paddingBottom: insets.bottom + spacing.lg }}
      refreshing={busy && page === 1} onRefresh={() => load(1, generation.current)}
      ListEmptyComponent={!error ? <EmptyState title={selling ? 'Ainda não tens vendas' : 'Ainda não tens encomendas'} message="As propostas de compra feitas no chat aparecem aqui." /> : null}
      ListFooterComponent={items.length < total ? <Button title="Carregar mais" variant="secondary" loading={busy} onPress={() => load(page + 1, generation.current)} /> : null}
      renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`${item.productTitle}, ${purchaseStatusLabels[item.status]}, abrir conversa`} onPress={() => openChat(item)} style={styles.card}>
        <View style={styles.row}><Text style={styles.title}>{item.productTitle}</Text><Text style={styles.status}>{purchaseStatusLabels[item.status]}</Text></View>
        <Text style={styles.meta}>{selling ? 'Comprador' : 'Vendedor'}: {item.participantName}</Text>
        <Text style={styles.meta}>{item.quantity} × {formatPrice(item.unitPriceSnapshot)} / {item.unit.replace(/^€\s*\/\s*/, '')}</Text>
        <Text style={styles.price}>Total indicativo: {formatPrice(item.totalPriceSnapshot)}</Text>
        <View style={styles.row}><Text style={styles.meta}>{formatDate(item.createdAt)}</Text><Text style={styles.link}>Abrir conversa →</Text></View>
      </Pressable>} />}
  </Screen>;
}
const styles = StyleSheet.create({
  page: { flex: 1, minHeight: 0, gap: spacing.md, paddingBottom: 0 },
  list: { flex: 1, minHeight: 0 },
  subtitle: { color: colors.textMuted, lineHeight: 21 },
  card: { padding: spacing.md, borderRadius: 16, backgroundColor: colors.surface, gap: spacing.sm, ...shadows.card },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, minWidth: 140, color: colors.text, fontWeight: '700', fontSize: 16 },
  status: { color: colors.primaryDarkFigo, backgroundColor: colors.primaryLightFigo, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, fontSize: 13 },
  meta: { color: colors.textMuted, fontSize: 13 }, price: { color: colors.primaryDarkFigo, fontWeight: '700' },
  link: { color: colors.primaryDarkFigo, fontWeight: '600' }, error: { color: colors.error }, errorBox: { gap: spacing.sm }
});
