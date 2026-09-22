import { Pressable, StyleSheet, Text, View } from 'react-native';
import EventPhoto from './EventPhoto';
import EventMeta from './EventMeta';
import { localEventDate } from '../../utils/eventDates';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import shadows from '../../theme/shadows';

export default function EventCard({ event, onPress }) {
  const date = localEventDate(event.date);
  return <Pressable accessibilityRole="button" accessibilityLabel={`${event.title}, ${date.toLocaleDateString('pt-PT')}`} onPress={onPress} style={styles.card}>
    <EventPhoto image={event.image} title={event.title} style={styles.image} />
    <View style={styles.content}>
      <View style={styles.date}>
        <Text style={styles.day}>{date.getDate()}</Text>
        <Text style={styles.month}>{date.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '').toUpperCase()}</Text>
        <Text style={styles.year}>{date.getFullYear()}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.type}>{event.type}</Text>
        <Text style={styles.title}>{event.title}</Text>
        <EventMeta event={event} />
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
});
