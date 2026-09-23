import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function EventMeta({ event, locationAction }) {
  return <View style={styles.content}>
    <View style={styles.locationRow}>
      <Text style={[styles.meta, styles.location]}><Ionicons name="location-outline" size={14} /> {event.location}</Text>
      {locationAction}
    </View>
    <Text style={styles.meta}><Ionicons name="time-outline" size={14} /> {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</Text>
    {Number.isFinite(event.distanceKm) && <Text style={styles.meta}>Distância de referência: {event.distanceKm.toLocaleString('pt-PT')} km</Text>}
    {event.free && <Text style={styles.badge}>Grátis</Text>}
  </View>;
}
const styles = StyleSheet.create({
  content: { gap: spacing.sm, alignItems: 'flex-start' },
  locationRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  location: { flex: 1, minWidth: 0 },
  meta: { color: colors.textMuted, fontSize: typography.sizes.body },
  badge: { color: colors.primaryDark, backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold }
});
