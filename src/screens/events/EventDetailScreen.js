import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/layout/Screen';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import EmptyState from '../../components/common/EmptyState';
import EventPoster from '../../components/common/EventPoster';
import EventMeta from '../../components/common/EventMeta';
import Button from '../../components/common/Button';
import useEvent from '../../hooks/useEvent';
import useEventDirections from '../../hooks/useEventDirections';
import { localEventDate } from '../../utils/eventDates';
import { eventCoordinates } from '../../utils/eventDirections';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';

export default function EventDetailScreen({ route, navigation }) {
  const { event, busy, error, notFound, retry } = useEvent(route.params?.eventId);
  const directions = useEventDirections(route.params?.eventId);
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
      <EventMeta event={event} locationAction={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Obter direções"
          accessibilityState={{ disabled: directions.pending || !eventCoordinates(event), busy: directions.pending }}
          disabled={directions.pending || !eventCoordinates(event)}
          onPress={() => directions.open(event)}
          style={({ pressed }) => [styles.directionsButton, (pressed || directions.pending || !eventCoordinates(event)) && styles.directionsButtonDimmed]}
        >
          {directions.pending
            ? <LoadingIndicator size="small" color={colors.primaryDarkFigo} style={styles.directionsIcon} />
            : <Ionicons name="navigate-outline" size={16} color={colors.primaryDarkFigo} />}
          <Text style={styles.directionsLabel}>Obter direções</Text>
        </Pressable>
      } />
      <View style={styles.directions}>
        <Text style={styles.directionsHint}>{!eventCoordinates(event)
          ? 'Este evento ainda não tem coordenadas disponíveis.'
          : event.locationSource === 'parish'
            ? 'O mapa calcula o trajeto e a distância desde a tua localização. O destino é aproximado, com base na freguesia.'
            : 'Consulta o trajeto, a distância e o tempo de viagem desde a tua localização atual.'}</Text>
        {directions.error ? <Text accessibilityRole="alert" style={styles.directionsError}>{directions.error}</Text> : null}
        {directions.chooseOrigin && <Button title="Definir origem no mapa" variant="secondary"
          disabled={directions.pending || !eventCoordinates(event)} onPress={() => directions.open(event, { chooseOrigin: true })} />}
      </View>
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
  description: { color: colors.text, fontSize: typography.sizes.body, lineHeight: 25 },
  directions: { gap: spacing.sm },
  directionsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5, minHeight: 44, maxWidth: '52%', paddingLeft: spacing.sm, backgroundColor: 'transparent' },
  directionsButtonDimmed: { opacity: 0.5 },
  directionsIcon: { width: 22, height: 22 },
  directionsLabel: { flexShrink: 1, textAlign: 'right', color: colors.primaryDarkFigo, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
  directionsHint: { color: colors.textMuted, fontSize: typography.sizes.caption, lineHeight: 20 },
  directionsError: { color: colors.error, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body }
});
