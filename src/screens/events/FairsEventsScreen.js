import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/layout/Screen';
import Chip from '../../components/common/Chip';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import EventCard from '../../components/common/EventCard';
import { editorialService, filterEvents, EVENT_FILTERS } from '../../services/editorialService';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function FairsEventsScreen() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    editorialService.getLocalEvents().then(data => { if (active) setItems(data); })
      .catch(() => { if (active) setError('Não foi possível carregar o conteúdo. Tenta novamente.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const today = new Date().toDateString();
  const visible = useMemo(() => filterEvents(items, filter), [items, filter, today]);
  const openItem = item => {
    // TODO: navigate to EventDetailScreen when the detail screen exists.
    Alert.alert(item.title, 'O detalhe deste evento estará disponível numa próxima versão.');
  };
  return <Screen scroll contentContainerStyle={styles.page}>
    <Text style={styles.subtitle}>Descobre o que vai acontecer na tua região.</Text>
    <View style={styles.context}>
      <Ionicons name="calendar-outline" size={25} color={colors.primaryDarkFigo} />
      <View style={styles.contextCopy}>
        <Text style={styles.contextTitle}>Próximos de ti</Text>
        <Text style={styles.contextDescription}>Mercados, feiras e encontros com produtores locais.</Text>
      </View>
    </View>
    <Text style={styles.notice}>Eventos fictícios de demonstração · setembro/outubro de 2026. As distâncias também são exemplos.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
      {EVENT_FILTERS.map(label => <Chip key={label} label={label} selected={filter === label} onPress={() => setFilter(label)} style={styles.chip} />)}
    </ScrollView>
    {loading ? <ActivityIndicator accessibilityLabel="A carregar" color={colors.primaryFigo} /> : error ? <View style={styles.feedback}>
      <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      <Button title="Tentar novamente" onPress={() => setRetry(value => value + 1)} />
    </View> : visible.length ? visible.map(item => <EventCard key={item.id} event={item} onPress={() => openItem(item)} />)
      : <View style={styles.feedback}><EmptyState title="Não encontrámos eventos" message="Experimenta alterar o período ou tipo de evento." /><Button title="Ver todos" variant="secondary" onPress={() => setFilter('Todos')} /></View>}
  </Screen>;
}
const styles = StyleSheet.create({
  page: { paddingTop: spacing.md, gap: spacing.md },
  subtitle: { color: colors.textMuted, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  context: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: 16, backgroundColor: '#FCECDD' },
  contextCopy: { flex: 1, gap: spacing.xs },
  contextTitle: { color: colors.primaryDarkFigo, fontSize: typography.sizes.subtitle, fontWeight: typography.weights.bold },
  contextDescription: { color: colors.text, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  notice: { color: colors.textMuted, fontSize: typography.sizes.caption, lineHeight: 18 },
  filters: { gap: spacing.sm }, chip: { minHeight: 44, justifyContent: 'center' },
  feedback: { gap: spacing.md }, error: { color: colors.error },
});
