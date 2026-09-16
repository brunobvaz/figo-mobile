import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reputationLabel } from '../../utils/chatTransactions';
import colors from '../../theme/colors';

export default function ProfileReputationCard({ reputation, onPress }) {
  const hasReviews = reputation?.count > 0 && Number.isFinite(reputation.average);
  return <View style={styles.highlight}>
    <Accent />
    <Pressable accessibilityRole="button" accessibilityLabel={`${reputationLabel(reputation)}. Ver avaliações recebidas`}
      accessibilityHint="Abre as avaliações e os comentários dos compradores."
      onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.summary}>
        <Ionicons accessible={false} name={hasReviews ? 'star' : 'star-outline'} size={27} color="#F4C400" />
        {hasReviews ? <Text style={styles.rating}>
          <Text style={styles.average}>{reputation.average.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</Text>
          <Text style={styles.count}> · {reputation.count} {reputation.count === 1 ? 'avaliação' : 'avaliações'}</Text>
        </Text> : <Text style={styles.empty}>Ainda sem avaliações</Text>}
        <Ionicons accessible={false} name="chevron-forward" size={18} color="#535560" />
      </View>
      <View style={styles.action}>
        <Text style={styles.link}>Ver avaliações</Text>
        <Ionicons accessible={false} name="arrow-forward" size={20} color={colors.primaryDarkFigo} />
      </View>
    </Pressable>
    <Accent mirrored />
  </View>;
}

function Accent({ mirrored = false }) {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[styles.accent, mirrored && styles.mirrored]}>
    <View style={[styles.ray, styles.upperRay]} />
    <View style={styles.ray} />
    <View style={[styles.ray, styles.lowerRay]} />
  </View>;
}

const styles = StyleSheet.create({
  highlight: { width: '100%', maxWidth: 336, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4, marginBottom: 6 },
  card: { flex: 1, minWidth: 0, maxWidth: 280, minHeight: 72, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F5EEFA', gap: 6 },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  rating: { flexShrink: 1 },
  average: { color: '#15151C', fontSize: 24, fontWeight: '800' },
  count: { color: '#7B8088', fontSize: 14 },
  empty: { flexShrink: 1, color: '#535560', fontSize: 14, fontWeight: '600' },
  action: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  link: { color: colors.primaryDarkFigo, fontSize: 14, textDecorationLine: 'underline' },
  accent: { width: 14, gap: 9, alignItems: 'flex-end' },
  mirrored: { transform: [{ scaleX: -1 }] },
  ray: { width: 12, height: 3, borderRadius: 2, backgroundColor: colors.primaryDarkFigo },
  upperRay: { width: 10, transform: [{ rotate: '40deg' }] },
  lowerRay: { width: 10, transform: [{ rotate: '-40deg' }] },
  pressed: { opacity: 0.75 }
});
