import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import EmptyState from '../common/EmptyState';
import LoadingIndicator from '../common/LoadingIndicator';
import { orderService } from '../../services/orderService';
import { reputationLabel } from '../../utils/chatTransactions';
import { formatDate } from '../../utils/formatters';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

// Mount only while open so every visit fetches fresh reviews and cannot inherit
// another seller's pages. Pending requests are ignored after closing.
export default function ReviewsSheet({ sellerId, sellerName, onClose, onOpenProfile }) {
  const [visible, setVisible] = useState(true);
  const [items, setItems] = useState([]);
  const [reputation, setReputation] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const active = useRef(false);
  const pending = useRef(false);
  const closing = useRef(false);
  const closed = useRef(false);
  const selectedAuthor = useRef(null);
  const finishClosing = () => {
    if (closed.current || !active.current) return;
    closed.current = true;
    onClose();
    if (selectedAuthor.current) onOpenProfile?.(selectedAuthor.current);
  };
  const close = authorId => {
    if (closing.current) return;
    closing.current = true;
    selectedAuthor.current = authorId || null;
    setVisible(false);
    // iOS must finish dismissing the native modal before pushing a profile.
    if (Platform.OS !== 'ios') finishClosing();
  };
  const load = useCallback(async page => {
    if (pending.current) return;
    pending.current = true; setLoading(true); setError(null);
    try {
      const result = await orderService.reviews(sellerId, page);
      if (!active.current) return;
      setItems(current => page === 1 ? result.items : [...new Map([...current, ...result.items].map(item => [item.id, item])).values()]);
      setReputation(result.reputation); setPagination(result.pagination);
    } catch {
      if (active.current) setError('Não foi possível carregar as avaliações. Tenta novamente.');
    } finally {
      pending.current = false;
      if (active.current) setLoading(false);
    }
  }, [sellerId]);
  useEffect(() => {
    active.current = true;
    load(1);
    return () => { active.current = false; };
  }, [load]);
  const hasMore = pagination && pagination.page * pagination.limit < pagination.total;
  const nextPage = () => load(pagination ? pagination.page + 1 : 1);
  return <Modal transparent visible={visible} animationType="slide" onRequestClose={() => close()} onDismiss={finishClosing}>
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Fechar avaliações" onPress={() => close()} />
      <SafeAreaView edges={['bottom', 'left', 'right']} accessibilityViewIsModal style={styles.sheet}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={styles.title}>Avaliações</Text>
            <Text style={styles.name}>{sellerName}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar avaliações" onPress={() => close()} style={styles.close}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
        </View>
        {reputation ? <Text style={styles.summary}>{reputationLabel(reputation)}</Text> : null}
        <FlatList data={items} keyExtractor={item => item.id} renderItem={({ item }) => <ReviewCard review={item} onOpenProfile={onOpenProfile ? close : undefined} />}
          style={styles.list} contentContainerStyle={styles.content}
          ListEmptyComponent={!loading && !error ? <EmptyState title="Ainda sem avaliações" message="As avaliações dos compradores aparecem aqui depois de concluírem a compra." /> : null}
          ListFooterComponent={<View style={styles.footer}>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {loading ? <LoadingIndicator message="A carregar avaliações…" color={colors.primaryFigo} /> : null}
            {!loading && (error || hasMore) ? <Button title={error ? 'Tentar novamente' : 'Ver mais avaliações'} variant="secondary" onPress={nextPage} /> : null}
          </View>} />
      </SafeAreaView>
    </View>
  </Modal>;
}

export function ReviewCard({ review, onOpenProfile }) {
  const canOpen = Boolean(review.authorId && onOpenProfile);
  return <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Pressable accessibilityRole={canOpen ? 'link' : undefined} accessibilityLabel={canOpen ? `Ver perfil de ${review.authorName}` : review.authorName}
        disabled={!canOpen} onPress={canOpen ? () => onOpenProfile(review.authorId) : undefined}
        style={({ pressed }) => [styles.authorLink, pressed && styles.pressed]}>
        <Avatar uri={review.authorAvatar} name={review.authorName} size={40} />
        <Text style={styles.author}>{review.authorName}</Text>
        {canOpen ? <Ionicons name="chevron-forward" size={15} color={colors.textMuted} /> : null}
      </Pressable>
      <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
    </View>
    <View accessible accessibilityLabel={`${review.rating} de 5 estrelas`} style={styles.stars}>
      {[1, 2, 3, 4, 5].map(value => <Ionicons key={value} accessible={false} name={value <= review.rating ? 'star' : 'star-outline'} size={17} color={colors.warning} />)}
    </View>
    <Text style={review.comment ? styles.comment : styles.noComment}>{review.comment || 'Sem comentário.'}</Text>
  </View>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { height: '80%', maxHeight: '90%', width: '100%', maxWidth: 560, alignSelf: 'center', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  header: { paddingTop: spacing.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heading: { flex: 1, gap: spacing.xs },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  name: { fontSize: 15, color: colors.textMuted },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  summary: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, color: colors.primaryDarkFigo, fontWeight: '600' },
  list: { flex: 1, minHeight: 0 },
  content: { padding: spacing.lg, gap: spacing.md },
  card: { padding: spacing.md, borderRadius: 16, backgroundColor: colors.surface, gap: spacing.sm },
  cardHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  authorLink: { flexDirection: 'row', alignItems: 'center', minHeight: 44, flexShrink: 1, gap: spacing.sm },
  pressed: { opacity: 0.7 },
  author: { flexShrink: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  date: { fontSize: 12, color: colors.textMuted },
  stars: { flexDirection: 'row', gap: 3 },
  comment: { color: colors.text, fontSize: 15, lineHeight: 22 },
  noComment: { color: colors.textMuted, fontSize: 14, fontStyle: 'italic' },
  footer: { gap: spacing.md },
  error: { color: colors.error, lineHeight: 21 }
});
