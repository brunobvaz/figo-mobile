import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../common/Avatar';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import shadows from '../../theme/shadows';

// Temporary display value until producer reviews are available from the backend.
const DEFAULT_RATING = 4.8;

// Uses the same seller object as ProductCard and SellerProfileScreen.
export default function ProducerCard({ producer, onPress }) {
  const locality = typeof producer.location === 'string' ? producer.location : producer.location?.city;
  const location = locality?.replace(/\b\d{4}-\d{3}\b/g, '').replace(/^[\s,·-]+|[\s,·-]+$/g, '') || producer.distance;
  const rating = Number.isFinite(producer.rating) ? producer.rating : DEFAULT_RATING;
  const count = Number.isFinite(producer.productCount)
    ? `${producer.productCount} ${producer.productCount === 1 ? 'produto' : 'produtos'}` : '';
  const description = [location, count].filter(Boolean).join(' · ');
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
    <Avatar uri={producer.avatar} name={producer.name || ''} size={56} />
    <View style={styles.details}>
      <Text numberOfLines={1} style={styles.name}>{producer.name}</Text>
      {description ? <Text numberOfLines={1} style={styles.meta}>{description}</Text> : null}
      <View style={styles.rating}>
        <Ionicons name="star" size={15} color={colors.warning} />
        <Text style={styles.ratingText}>{rating.toLocaleString('pt-PT', { maximumFractionDigits: 1 })}</Text>
      </View>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { width: 240, minHeight: 88, flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm + spacing.xs, borderRadius: 18, backgroundColor: colors.surface, ...shadows.card },
  details: { flex: 1, minWidth: 0, gap: spacing.xs },
  name: { fontSize: 14, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted },
  rating: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ratingText: { fontSize: 12, fontWeight: '600', color: colors.text },
});
