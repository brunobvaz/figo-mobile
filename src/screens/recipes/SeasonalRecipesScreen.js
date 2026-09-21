import LoadingIndicator from '../../components/common/LoadingIndicator';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/layout/Screen';
import Chip from '../../components/common/Chip';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import RecipeCard from '../../components/common/RecipeCard';
import { RECIPE_FILTERS } from '../../services/editorialService';
import useRecipes from '../../hooks/useRecipes';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function SeasonalRecipesScreen({ navigation }) {
  const [filter, setFilter] = useState('Todos');
  const { items, busy, error, refreshing, hasMore, refresh, retry, loadMore } = useRecipes(filter);
  const openItem = item => navigation.navigate(ROUTES.RECIPE_DETAIL, { recipeId: item.id });
  return <Screen scroll contentContainerStyle={styles.page}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primaryFigo} colors={[colors.primaryFigo]} />}>
    <Text style={styles.subtitle}>Ideias para cozinhar com o melhor de cada estação.</Text>
    <View style={styles.context}>
      <Ionicons name="leaf-outline" size={25} color={colors.primaryDark} />
      <View style={styles.contextCopy}>
        <Text style={styles.contextTitle}>{`Sabores de ${new Date().toLocaleDateString('pt-PT', { month: 'long' })}`}</Text>
        <Text style={styles.contextDescription}>Descobre receitas com produtos que estão na época.</Text>
      </View>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filters}>
      {RECIPE_FILTERS.map(label => <Chip key={label} label={label} selected={filter === label} onPress={() => setFilter(label)} style={styles.chip} />)}
    </ScrollView>
    {busy && items.length === 0 ? <LoadingIndicator accessibilityLabel="A carregar receitas" color={colors.primaryFigo} /> : <>
      {items.map(item => <RecipeCard key={item.id} recipe={item} onPress={() => openItem(item)} />)}
      {error ? <View style={styles.feedback}>
        <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
        <Button title="Tentar novamente" variant="secondary" onPress={retry} disabled={busy} />
      </View> : !items.length ? <View style={styles.feedback}>
        <EmptyState title="Não encontrámos receitas" message={filter === 'Todos' ? 'Ainda não há receitas disponíveis. Volta a visitar esta página em breve.' : 'Experimenta escolher outra categoria.'} />
        {filter !== 'Todos' && <Button title="Ver todas" variant="secondary" onPress={() => setFilter('Todos')} />}
      </View> : null}
      {hasMore && !error && <Button title="Carregar mais" variant="secondary" loading={busy} onPress={loadMore} />}
    </>}
  </Screen>;
}
const styles = StyleSheet.create({
  page: { paddingTop: spacing.md, gap: spacing.md },
  subtitle: { color: colors.textMuted, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  context: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: 16, backgroundColor: colors.primaryLight },
  contextCopy: { flex: 1, gap: spacing.xs },
  contextTitle: { color: colors.primaryDark, fontSize: typography.sizes.subtitle, fontWeight: typography.weights.bold },
  contextDescription: { color: colors.text, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  filtersScroll: { flexGrow: 0, flexShrink: 0 },
  filters: { gap: spacing.sm, alignItems: 'center' }, chip: { minHeight: 44, justifyContent: 'center' },
  feedback: { gap: spacing.md }, error: { color: colors.error },
});
