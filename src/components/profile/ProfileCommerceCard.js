import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reputationLabel } from '../../utils/chatTransactions';
import colors from '../../theme/colors';

export default function ProfileCommerceCard({ reputation, salesCount, onReviewsPress }) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.25;
  const hasReviews = reputation?.count > 0 && Number.isFinite(reputation.average);
  const stars = hasReviews ? Math.round(reputation.average * 2) / 2 : 0;
  return <View style={styles.card}>
    <View style={[styles.stats, stacked && styles.stacked]}>
      <View accessible accessibilityLabel={reputationLabel(reputation)} style={[styles.reviews, stacked && styles.stackedStat]}>
        <Text style={styles.average}>{hasReviews ? reputation.average.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—'}</Text>
        <View style={styles.ratingDetails}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(value => <Ionicons key={value} accessible={false}
              name={stars >= value || stars < value - 0.5 ? 'star' : 'star-half'} size={18}
              color={stars >= value - 0.5 ? '#F5B300' : '#D3CDD7'} />)}
          </View>
          <Text style={styles.caption}>{hasReviews ? `${reputation.count} ${reputation.count === 1 ? 'avaliação' : 'avaliações'}` : 'Sem avaliações'}</Text>
        </View>
      </View>
      <View style={[styles.divider, stacked && styles.horizontalDivider]} />
      <View accessible accessibilityLabel={`${salesCount} ${salesCount === 1 ? 'venda finalizada' : 'vendas finalizadas'}`} style={[styles.sales, stacked && styles.stackedStat]}>
        <Ionicons accessible={false} name="bag-handle-outline" size={28} color={colors.primaryDarkFigo} />
        <View style={styles.salesDetails}>
          <Text style={styles.salesCount}>{salesCount}</Text>
          <Text style={styles.caption}>{salesCount === 1 ? 'venda finalizada' : 'vendas finalizadas'}</Text>
        </View>
      </View>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Ver avaliações" onPress={onReviewsPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.buttonText}>Ver avaliações</Text>
      <Ionicons accessible={false} name="arrow-forward" size={21} color={colors.surface} />
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 18, backgroundColor: '#F3EBF8', gap: 14 },
  stats: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  stacked: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
  stackedStat: { flex: 0, alignSelf: 'stretch' },
  reviews: { flex: 1.35, flexDirection: 'row', alignItems: 'center', gap: 10 },
  average: { color: colors.primaryDarkFigo, fontSize: 32, fontWeight: '800' },
  ratingDetails: { flexShrink: 1, minWidth: 0, gap: 4 },
  stars: { flexDirection: 'row', gap: 1 },
  caption: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: '#D6C5E2', marginHorizontal: 14 },
  horizontalDivider: { width: '100%', height: 1, marginHorizontal: 0 },
  sales: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  salesDetails: { flex: 1, minWidth: 0 },
  salesCount: { color: colors.primaryDarkFigo, fontSize: 26, fontWeight: '700' },
  button: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.primaryDarkFigo },
  buttonText: { flexShrink: 1, color: colors.surface, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: 0.75 }
});
