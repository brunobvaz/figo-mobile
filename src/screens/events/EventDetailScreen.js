import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/layout/Screen';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import EmptyState from '../../components/common/EmptyState';
import EventPoster from '../../components/common/EventPoster';
import EventMeta from '../../components/common/EventMeta';
import useEvent from '../../hooks/useEvent';
import { localEventDate } from '../../utils/eventDates';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';

export default function EventDetailScreen({ route, navigation }) {
  const { event, busy, error, notFound, retry } = useEvent(route.params?.eventId);
  if (busy) return <Screen contentContainerStyle={styles.centered}>
    <LoadingIndicator accessibilityLabel="A carregar evento" color={colors.primaryFigo} />
  </Screen>;
  if (!event) return <Screen contentContainerStyle={styles.centered}>
    <EmptyState title={notFound ? 'Evento indisponível' : 'Não foi possível carregar o evento'} message={error}
      actionLabel={notFound ? 'Voltar aos eventos' : 'Tentar novamente'} onAction={notFound ? () => navigation.goBack() : retry} />
  </Screen>;
  return <Screen scroll maxWidth="100%" contentContainerStyle={styles.page}>
    <EventPoster key={`${event.id}:${event.image}`} image={event.image} title={event.title} />
    <View style={styles.content}>
      <Text style={styles.type}>{event.type}</Text>
      <Text accessibilityRole="header" style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>{localEventDate(event.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      <EventMeta event={event} />
      {event.description ? <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.heading}>Sobre o evento</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View> : null}
    </View>
  </Screen>;
}
const styles = StyleSheet.create({
  centered: { justifyContent: 'center' },
  page: { paddingHorizontal: 0, gap: spacing.lg },
  content: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', padding: spacing.md, gap: spacing.md },
  type: { color: colors.primaryDarkFigo, fontSize: typography.sizes.body, fontWeight: typography.weights.semibold },
  title: { color: colors.text, fontSize: typography.sizes.screenTitle, fontWeight: typography.weights.bold },
  date: { color: colors.primaryDarkFigo, fontSize: typography.sizes.subtitle, fontWeight: typography.weights.semibold },
  section: { gap: spacing.sm, marginTop: spacing.md },
  heading: { color: colors.text, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  description: { color: colors.text, fontSize: typography.sizes.body, lineHeight: 25 }
});
