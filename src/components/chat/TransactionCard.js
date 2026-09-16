import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../common/Button';
import { formatPrice } from '../../utils/formatters';
import { activeTransactionStatuses, purchaseHistory } from '../../utils/chatTransactions';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

const palettes = {
  pending: { background: '#FFF8E9', border: '#EAD5A5', foreground: '#825B18', tint: '#F8EBCB' },
  progress: { background: '#F6F0FA', border: '#E3D6E9', foreground: colors.primaryDarkFigo, tint: '#EAE0F1' },
  done: { background: '#EFF6EB', border: '#D4E4CD', foreground: colors.primaryDark, tint: '#DDEBD5' },
  closed: { background: '#F3F3F0', border: colors.border, foreground: '#5E655F', tint: '#E6E8E2' }
};
const states = {
  pending: { label: 'Pendente', icon: 'time-outline', tone: 'pending' },
  accepted: { label: 'A confirmar', icon: 'people-outline', tone: 'progress' },
  buyer_confirmed: { label: 'A confirmar', icon: 'people-outline', tone: 'progress' },
  seller_confirmed: { label: 'Em curso', icon: 'bag-handle-outline', tone: 'progress' },
  completed: { label: 'Avaliação pendente', icon: 'star-outline', tone: 'pending' },
  reviewed: { label: 'Finalizada', icon: 'checkmark-circle-outline', tone: 'done' },
  declined: { label: 'Recusada', icon: 'close-circle-outline', tone: 'closed' },
  cancelled: { label: 'Cancelada', icon: 'close-circle-outline', tone: 'closed' }
};
const milestoneLabels = {
  proposal: 'Proposta enviada', accepted: 'Proposta aceite pelo vendedor',
  buyer_confirmed: 'Acordo confirmado pelo comprador', seller_confirmed: 'Acordo confirmado pelo vendedor',
  completed: 'Compra concluída pelo comprador', reviewed: 'Avaliação enviada', declined: 'Proposta recusada pelo vendedor'
};
const dateLabel = value => new Date(value).toLocaleString('pt-PT', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

export default function TransactionCard({ event, userId, buyerName, sellerName, busy, canInteract = true,
  expanded = false, onToggle, canRepeat = false, onRepeat, onAction }) {
  const { transaction: purchase, purchaseNumber } = event;
  const seller = userId === purchase.sellerId;
  const buyer = userId === purchase.buyerId;
  const active = activeTransactionStatuses.includes(purchase.status);
  const disabled = Boolean(busy) || !canInteract;
  const state = states[purchase.status] || states.cancelled;
  const palette = palettes[state.tone];
  const history = event.history || purchaseHistory(purchase);
  // Preserve the actual direction of legacy reviews; never relabel their author.
  const review = purchase.reviews?.find(item => item.reviewerId === purchase.buyerId) || purchase.reviews?.[0];
  const sentReview = review?.reviewerId === userId;
  const next = {
    pending: buyer ? 'A aguardar que o vendedor aceite a proposta.' : `${buyerName} enviou uma proposta de compra.`,
    accepted: buyer ? 'Confirma a compra depois de combinarem os detalhes finais.' : 'A aguardar que o comprador confirme o acordo final.',
    buyer_confirmed: seller ? 'O comprador confirmou. Confirma também o acordo final.' : 'A aguardar que o vendedor confirme o acordo final.',
    seller_confirmed: buyer ? 'O acordo está confirmado por ambos. Conclui a compra depois de receberes o produto.' : 'O acordo está confirmado por ambos. A aguardar que o comprador conclua a compra.',
    completed: buyer ? `Compra concluída. Como correu a experiência com ${sellerName}?` : 'Compra concluída. A aguardar a avaliação do comprador.'
  }[purchase.status];
  const action = purchase.status === 'pending' && seller ? ['accept', 'Aceitar proposta']
    : purchase.status === 'accepted' && buyer ? ['confirm-buyer', 'Confirmar compra']
      : purchase.status === 'buyer_confirmed' && seller ? ['confirm-seller', 'Confirmar venda']
        : purchase.status === 'seller_confirmed' && buyer ? ['complete', 'Marcar como concluída']
          : purchase.status === 'completed' && buyer ? ['review', 'Avaliar vendedor'] : null;
  const repeat = canRepeat && event.isLatest && purchase.status === 'reviewed' && buyer && canInteract;

  return <View style={[styles.card, { backgroundColor: palette.background, borderColor: palette.border }]}>
    <View style={styles.heading}>
      <View style={[styles.icon, { backgroundColor: palette.tint }]}>
        <Ionicons accessible={false} name={state.icon} size={22} color={palette.foreground} />
      </View>
      <View style={styles.identity}>
        <Text accessibilityRole="header" style={styles.title}>Compra #{purchaseNumber}</Text>
        <Text style={styles.date}>{dateLabel(purchase.createdAt)}</Text>
      </View>
    </View>
    <View style={[styles.badge, { backgroundColor: palette.tint }]}>
      <Text style={[styles.badgeText, { color: palette.foreground }]}>{state.label}</Text>
    </View>
    <View style={styles.summary}>
      <Text style={styles.product}>{purchase.quantity} × {purchase.productTitle}</Text>
      <Text style={styles.total}>Total indicativo · <Text style={styles.amount}>{formatPrice(purchase.totalPriceSnapshot)}</Text></Text>
    </View>
    {active ? <View style={styles.next}>
      <Text accessibilityLiveRegion="polite" style={styles.description}>{next}</Text>
      {action ? <Button title={action[1]} loading={busy === `${purchase.id}:${action[0]}`} disabled={disabled} onPress={() => onAction(action[0], purchase)} /> : null}
      {purchase.status === 'pending' && seller ? <Button title="Recusar" variant="secondary" loading={busy === `${purchase.id}:decline`} disabled={disabled} onPress={() => onAction('decline', purchase)} /> : null}
      {purchase.status !== 'completed' ? <Text style={styles.note}>Pagamento e entrega combinados diretamente entre vocês.</Text> : null}
    </View> : null}
    <Pressable accessibilityRole="button" accessibilityLabel={`${expanded ? 'Ocultar' : 'Ver'} detalhes da compra ${purchaseNumber}`}
      accessibilityState={{ expanded }} onPress={onToggle} style={styles.toggle}>
      <Text style={styles.toggleText}>{expanded ? 'Ocultar detalhes' : 'Ver detalhes'}</Text>
      <Ionicons accessible={false} name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primaryDarkFigo} />
    </Pressable>
    {expanded ? <View style={[styles.details, { borderColor: palette.border }]}>
      <Text style={styles.detailsTitle}>Percurso da compra</Text>
      {history.map((milestone, index) => <View key={milestone.stage} style={styles.milestone}>
        <View style={styles.track}>
          <Ionicons accessible={false} name={milestone.stage === 'declined' ? 'close-circle-outline' : 'checkmark-circle-outline'} size={17} color={palette.foreground} />
          {index < history.length - 1 ? <View style={[styles.line, { backgroundColor: palette.border }]} /> : null}
        </View>
        <View style={styles.milestoneBody}>
          <Text style={styles.milestoneLabel}>{milestoneLabels[milestone.stage]}</Text>
          <Text style={styles.date}>{dateLabel(milestone.createdAt)}</Text>
        </View>
      </View>)}
      {purchase.status === 'reviewed' && review ? <View style={styles.review}>
        <View accessible accessibilityLabel={`Avaliação ${sentReview ? 'enviada' : 'recebida'}: ${review.rating} de 5 estrelas`}>
          <Text style={styles.reviewStars}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
          <Text style={styles.reviewLabel}>{sentReview ? 'Avaliação enviada' : 'Avaliação recebida'} · {review.rating}/5</Text>
        </View>
        {review.comment ? <Text style={styles.description}>{review.comment}</Text> : null}
      </View> : null}
    </View> : null}
    {repeat ? <Button title="Comprar novamente" loading={busy === 'prepare'} disabled={disabled} onPress={() => onRepeat(purchase)} /> : null}
  </View>;
}
const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: spacing.md, gap: spacing.sm, borderWidth: 1 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  identity: { flex: 1, gap: 3 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  date: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  badge: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontWeight: '600', fontSize: 12 },
  summary: { gap: 4 },
  product: { color: colors.text, fontSize: 15, fontWeight: '600', lineHeight: 21 },
  total: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  amount: { color: colors.text, fontWeight: '700' },
  next: { gap: spacing.sm, paddingTop: 4 },
  description: { color: colors.text, fontSize: 14, lineHeight: 21 },
  note: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  toggle: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  toggleText: { color: colors.primaryDarkFigo, fontSize: 13, fontWeight: '600' },
  details: { borderTopWidth: 1, paddingTop: spacing.md },
  detailsTitle: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing.md },
  milestone: { flexDirection: 'row', gap: spacing.sm },
  track: { alignItems: 'center', width: 18 },
  line: { width: 1, flex: 1, marginVertical: 3 },
  milestoneBody: { flex: 1, gap: 2, paddingBottom: spacing.md },
  milestoneLabel: { color: colors.text, fontSize: 13, lineHeight: 18 },
  review: { borderRadius: 12, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.sm },
  reviewStars: { color: '#AD701D', fontSize: 22, letterSpacing: 2 },
  reviewLabel: { color: colors.text, fontSize: 13, fontWeight: '600', marginTop: 4 }
});
