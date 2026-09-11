import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import shadows from '../../theme/shadows';

export default function EventCard({ event, onPress }) {
  const [failedImage, setFailedImage] = useState(null);
  const date = new Date(`${event.date}T12:00:00`);
  const source = typeof event.image === 'string' ? { uri: event.image } : event.image;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${event.title}, ${date.toLocaleDateString('pt-PT')}`} onPress={onPress} style={styles.card}>
    {source && failedImage !== event.image ? <Image source={source} style={styles.image} onError={() => setFailedImage(event.image)} /> : null}
    <View style={styles.content}>
      <View style={styles.date}>
        <Text style={styles.day}>{date.getDate()}</Text>
        <Text style={styles.month}>{date.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '').toUpperCase()}</Text>
        <Text style={styles.year}>{date.getFullYear()}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.type}>{event.type}</Text>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}><Ionicons name="location-outline" size={14} /> {event.location}</Text>
        <Text style={styles.meta}><Ionicons name="time-outline" size={14} /> {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</Text>
        <View style={styles.footer}>
          {Number.isFinite(event.distanceKm) ? <Text style={styles.meta}>{event.distanceKm.toLocaleString('pt-PT')} km</Text> : null}
          {event.free ? <Text style={styles.badge}>Grátis</Text> : null}
        </View>
      </View>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surface, ...shadows.card },
  image: { width: '100%', height: 104 },
  content: { padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  date: { minWidth: 58, alignItems: 'center', gap: spacing.xs, padding: spacing.sm, borderRadius: 12, backgroundColor: colors.cream },
  day: { color: colors.primaryDarkFigo, fontSize: typography.sizes.screenTitle, fontWeight: typography.weights.bold },
  month: { color: colors.primaryDarkFigo, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold },
  year: { color: colors.textMuted, fontSize: typography.sizes.caption },
  details: { flex: 1, minWidth: 0, gap: spacing.sm },
  type: { color: colors.primaryDarkFigo, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
  title: { color: colors.text, fontSize: typography.sizes.subtitle, fontWeight: typography.weights.bold },
  meta: { color: colors.textMuted, fontSize: typography.sizes.body },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  badge: { color: colors.primaryDark, backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
});
