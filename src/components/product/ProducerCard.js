import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../common/Avatar';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { profileLocation } from '../../utils/activeLocation';

// Uses the same seller object as ProductCard and SellerProfileScreen.
export default function ProducerCard({ producer, onPress, style }) {
  const { fontScale } = useWindowDimensions();
  const place = profileLocation(producer.location);
  const location = place.municipality || place.parish || producer.distance;
  const rating = producer.reputation?.count ? producer.reputation.average : null;
  const count = Number.isFinite(producer.productCount)
    ? `${producer.productCount} ${producer.productCount === 1 ? 'produto' : 'produtos'}` : '';
  const description = [location, count].filter(Boolean).join(' · ');
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.card, style]}>
    <Avatar uri={producer.avatar} name={producer.name || ''} size={56} />
    <View style={styles.details}>
      <Text numberOfLines={fontScale > 1.3 ? undefined : 2} style={styles.name}>{producer.name}</Text>
      {description ? <Text numberOfLines={fontScale > 1.3 ? undefined : 1} style={styles.meta}>{description}</Text> : null}
      <View style={styles.rating}>
        <Ionicons name="star" size={15} color={colors.warning} />
        <Text style={styles.ratingText}>{rating == null ? 'Sem avaliações' : `${rating.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · ${producer.reputation.count} ${producer.reputation.count === 1 ? 'avaliação' : 'avaliações'}`}</Text>
      </View>
      {Number.isFinite(producer.salesCount) ? <Text style={styles.meta}>{producer.salesCount} {producer.salesCount === 1 ? 'venda finalizada' : 'vendas finalizadas'}</Text> : null}
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { width: 264, minHeight: 104, flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm + spacing.xs, borderRadius: 20, backgroundColor: colors.surface },
  details: { flex: 1, minWidth: 0, gap: spacing.xs },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted },
  rating: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ratingText: { flexShrink: 1, fontSize: 13, fontWeight: '600', color: colors.text },
});
