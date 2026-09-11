import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/layout/Screen';
import Chip from '../../components/common/Chip';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import RecipeCard from '../../components/common/RecipeCard';
import { editorialService, filterRecipes, RECIPE_FILTERS } from '../../services/editorialService';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function SeasonalRecipesScreen() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    editorialService.getSeasonalRecipes().then(data => { if (active) setItems(data); })
      .catch(() => { if (active) setError('Não foi possível carregar o conteúdo. Tenta novamente.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const today = new Date().toDateString();
  const visible = useMemo(() => filterRecipes(items, filter), [items, filter, today]);
  const openItem = item => {
    // TODO: navigate to RecipeDetailScreen when the detail screen exists.
    Alert.alert(item.title, 'O detalhe desta receita estará disponível numa próxima versão.');
  };
  return <Screen scroll contentContainerStyle={styles.page}>
    <Text style={styles.subtitle}>Ideias para cozinhar com o melhor de cada estação.</Text>
    <View style={styles.context}>
      <Ionicons name="leaf-outline" size={25} color={colors.primaryDark} />
      <View style={styles.contextCopy}>
        <Text style={styles.contextTitle}>{`Sabores de ${new Date().toLocaleDateString('pt-PT', { month: 'long' })}`}</Text>
        <Text style={styles.contextDescription}>Descobre receitas com produtos que estão na época.</Text>
      </View>
    </View>
    <Text style={styles.notice}>Receitas de demonstração · seleção sazonal ilustrativa.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
      {RECIPE_FILTERS.map(label => <Chip key={label} label={label} selected={filter === label} onPress={() => setFilter(label)} style={styles.chip} />)}
    </ScrollView>
    {loading ? <ActivityIndicator accessibilityLabel="A carregar" color={colors.primaryFigo} /> : error ? <View style={styles.feedback}>
      <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      <Button title="Tentar novamente" onPress={() => setRetry(value => value + 1)} />
    </View> : visible.length ? visible.map(item => <RecipeCard key={item.id} recipe={item} onPress={() => openItem(item)} />)
      : <View style={styles.feedback}><EmptyState title="Não encontrámos receitas" message="Experimenta escolher outra categoria." /><Button title="Ver todas" variant="secondary" onPress={() => setFilter('Todos')} /></View>}
  </Screen>;
}
const styles = StyleSheet.create({
  page: { paddingTop: spacing.md, gap: spacing.md },
  subtitle: { color: colors.textMuted, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  context: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: 16, backgroundColor: colors.primaryLight },
  contextCopy: { flex: 1, gap: spacing.xs },
  contextTitle: { color: colors.primaryDark, fontSize: typography.sizes.subtitle, fontWeight: typography.weights.bold },
  contextDescription: { color: colors.text, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  notice: { color: colors.textMuted, fontSize: typography.sizes.caption, lineHeight: 18 },
  filters: { gap: spacing.sm }, chip: { minHeight: 44, justifyContent: 'center' },
  feedback: { gap: spacing.md }, error: { color: colors.error },
});
