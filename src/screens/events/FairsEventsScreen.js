import LoadingIndicator from '../../components/common/LoadingIndicator';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/layout/Screen';
import Chip from '../../components/common/Chip';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import EventCard from '../../components/common/EventCard';
import { EVENT_FILTERS } from '../../services/editorialService';
import useEvents from '../../hooks/useEvents';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function FairsEventsScreen({ navigation }) {
  const [filter, setFilter] = useState('Todos');
  const { items, busy, error, refreshing, hasMore, refresh, retry, loadMore } = useEvents(filter);
  const openItem = item => navigation.navigate(ROUTES.EVENT_DETAIL, { eventId: item.id });
  return <Screen scroll contentContainerStyle={styles.page}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primaryFigo} colors={[colors.primaryFigo]} />}>
    <Text style={styles.subtitle}>Descobre feiras, mercados e encontros com produtores.</Text>
    <View style={styles.context}>
      <Ionicons name="calendar-outline" size={25} color={colors.primaryDarkFigo} />
      <View style={styles.contextCopy}>
        <Text style={styles.contextTitle}>Agenda local</Text>
        <Text style={styles.contextDescription}>Mercados, feiras e encontros com produtores locais.</Text>
      </View>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filters}>
      {EVENT_FILTERS.map(label => <Chip key={label} label={label} selected={filter === label} onPress={() => setFilter(label)} style={styles.chip} />)}
    </ScrollView>
    {busy && items.length === 0 ? <LoadingIndicator accessibilityLabel="A carregar eventos" color={colors.primaryFigo} /> : <>
      {items.map(item => <EventCard key={item.id} event={item} onPress={() => openItem(item)} />)}
      {error ? <View style={styles.feedback}>
        <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
        <Button title="Tentar novamente" variant="secondary" onPress={retry} disabled={busy} />
      </View> : !items.length ? <View style={styles.feedback}>
        <EmptyState title="Não encontrámos eventos" message={filter === 'Todos' ? 'Ainda não há eventos disponíveis. Volta a visitar esta página em breve.' : 'Experimenta alterar o período ou tipo de evento.'} />
        {filter !== 'Todos' && <Button title="Ver todos" variant="secondary" onPress={() => setFilter('Todos')} />}
      </View> : null}
      {hasMore && !error && <Button title="Carregar mais" variant="secondary" loading={busy} onPress={loadMore} />}
    </>}
  </Screen>;
}
const styles = StyleSheet.create({
  page: { paddingTop: spacing.md, gap: spacing.md },
  subtitle: { color: colors.textMuted, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  context: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: 16, backgroundColor: '#FCECDD' },
  contextCopy: { flex: 1, gap: spacing.xs },
  contextTitle: { color: colors.primaryDarkFigo, fontSize: typography.sizes.subtitle, fontWeight: typography.weights.bold },
  contextDescription: { color: colors.text, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  filtersScroll: { flexGrow: 0, flexShrink: 0 },
  filters: { gap: spacing.sm, alignItems: 'center' }, chip: { minHeight: 44, justifyContent: 'center' },
  feedback: { gap: spacing.md }, error: { color: colors.error },
});
