import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Chip from '../../components/common/Chip';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Screen from '../../components/layout/Screen';
import ProductCard from '../../components/product/ProductCard';
import ExploreFilterSheet from '../../components/explore/ExploreFilterSheet';
import ExploreMap from '../../components/explore/ExploreMap';
import { locationService } from '../../services/locationService';
import useProducts from '../../hooks/useProducts';
import useExploreProducts from '../../hooks/useExploreProducts';
import { hasExploreFilters, resetExploreFilters, SORT_OPTIONS } from '../../utils/exploreFilters';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

const EMPTY_FILTERS = {};
export default function ExploreScreen({ navigation, route }) {
  const filters = route.params?.filters || EMPTY_FILTERS;
  const { products: cachedProducts } = useProducts();
  const [panel, setPanel] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [region, setRegion] = useState({});
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const attemptedLocation = useRef(false);
  const locationInFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  // Migrate legacy direct category links once into the existing canonical payload.
  useEffect(() => {
    if (route.params?.category) navigation.setParams({ filters: { ...filters, category: route.params.category }, category: undefined });
  }, [route.params?.category, navigation]);
  const updateFilters = patch => navigation.setParams({ filters: { ...filters, ...patch }, category: undefined });
  const clear = () => navigation.setParams({ filters: resetExploreFilters(filters), category: undefined });
  const viewMode = filters.viewMode === 'map' ? 'map' : 'list';
  const proximity = filters.radiusKm != null || filters.sortBy === 'distance';
  const locate = useCallback(async () => {
    if (locationInFlight.current) return;
    attemptedLocation.current = true; locationInFlight.current = true;
    setLocating(true); setLocationError('');
    try {
      const value = await locationService.current();
      if (mounted.current) setCoordinates(value);
    } catch (error) { if (mounted.current) setLocationError(error.message); }
    finally { locationInFlight.current = false; if (mounted.current) setLocating(false); }
  }, []);
  useEffect(() => { if (proximity && !coordinates && !attemptedLocation.current) locate(); }, [proximity, coordinates, locate]);
  const results = useExploreProducts(filters, coordinates, region);
  const { width, fontScale } = useWindowDimensions();
  const columns = width >= 360 && fontScale <= 1.3 ? 2 : 1;
  const cardWidth = (width - spacing.md * 2 - (columns - 1) * spacing.md) / columns;
  const producers = useMemo(() => [...new Map(cachedProducts.filter(item => item.seller?.id).map(item => [item.seller.id, item.seller])).values()], [cachedProducts]);
  const openProduct = product => navigation.navigate(ROUTES.PRODUCT_DETAILS, { productId: product.id });
  const editorialFilter = Boolean(filters.featured || filters.seasonal);
  const count = editorialFilter ? `${results.products.length} produtos${results.hasMore ? ' carregados' : ''}` : `${results.total ?? 0} produtos`;
  const activeChips = [
    ...(filters.radiusKm != null ? [{ label: `Até ${filters.radiusKm} km`, patch: { radiusKm: undefined } }] : []),
    ...(filters.category && filters.category !== 'Todos' ? [{ label: filters.category, patch: { category: undefined } }] : []),
    ...(filters.minPrice != null || filters.maxPrice != null ? [{ label: filters.minPrice != null && filters.maxPrice != null ? `${filters.minPrice} € – ${filters.maxPrice} €` : filters.maxPrice != null ? `Até ${filters.maxPrice} €` : `Desde ${filters.minPrice} €`, patch: { minPrice: undefined, maxPrice: undefined } }] : []),
    ...(filters.featured ? [{ label: 'Em destaque', patch: { featured: undefined } }] : []),
    ...(filters.seasonal ? [{ label: 'Da época', patch: { seasonal: undefined } }] : []),
    ...(filters.availableOnly ? [{ label: 'Apenas disponíveis', patch: { availableOnly: undefined } }] : []),
    ...(filters.unit ? [{ label: filters.unit.replace('€/', ''), patch: { unit: undefined } }] : []),
    ...(filters.sellerId ? [{ label: producers.find(item => item.id === filters.sellerId)?.name || 'Produtor', patch: { sellerId: undefined } }] : []),
  ];
  const empty = !results.busy && !results.error ? <View>
    <EmptyState title="Não encontrámos produtos" message="Tenta aumentar a distância ou remover alguns filtros." />
    {results.hasMore ? <Text style={styles.help}>Sem correspondências nesta página. Podes carregar mais produtos.</Text> : null}
    <Button title="Limpar filtros" variant="secondary" onPress={clear} />
  </View> : null;
  const loadMore = results.hasMore ? <Button title="Carregar mais" variant="secondary" loading={results.busy} onPress={results.loadMore} /> : null;
  return <Screen contentContainerStyle={styles.page}>
    <View style={styles.search}>
      <View style={styles.searchInput}><Input leadingIcon="search-outline" placeholder="Pesquisar produtos..." accessibilityLabel="Pesquisar produtos" value={filters.query || ''} maxLength={100} onChangeText={query => updateFilters({ query })} returnKeyType="search" /></View>
      {filters.query ? <Pressable accessibilityRole="button" accessibilityLabel="Limpar pesquisa" style={styles.clearSearch} onPress={() => updateFilters({ query: undefined })}><Ionicons name="close-circle" size={23} color={colors.primaryDarkFigo} /></Pressable> : null}
    </View>
    <View style={styles.segment} accessibilityRole="tablist">
      {[['list', 'Lista', 'list-outline'], ['map', 'Mapa', 'map-outline']].map(([value, label, icon]) => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: viewMode === value }} style={[styles.tab, viewMode === value && styles.activeTab]} onPress={() => updateFilters({ viewMode: value })}>
        <Ionicons name={icon} size={18} color={viewMode === value ? colors.primaryDarkFigo : colors.textMuted} /><Text style={[styles.tabText, viewMode === value && styles.activeText]}>{label}</Text>
      </Pressable>)}
    </View>
    <ScrollView horizontal style={styles.horizontal} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {[['distance', 'Distância', filters.radiusKm != null], ['category', 'Categoria', Boolean(filters.category)], ['price', 'Preço', filters.minPrice != null || filters.maxPrice != null], ['more', 'Mais filtros', Boolean(filters.featured || filters.seasonal || filters.availableOnly || filters.unit || filters.sellerId)]].map(([key, label, selected]) => <Chip key={key} label={label} trailingIcon={key === 'more' ? undefined : 'chevron-down'} selected={selected} style={styles.chip} onPress={() => setPanel(key)} />)}
    </ScrollView>
    {activeChips.length ? <ScrollView horizontal style={styles.horizontal} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {activeChips.map(({ label, patch }) => <Chip key={Object.keys(patch)[0]} label={`${label} ×`} accessibilityLabel={`Remover filtro: ${label}`} selected style={styles.chip} onPress={() => updateFilters(patch)} />)}
    </ScrollView> : null}
    {proximity && !coordinates ? <Pressable accessibilityRole="button" onPress={() => setPanel('distance')}><Text numberOfLines={2} style={styles.locationNote}>{locating ? 'A obter localização… A pesquisa continua disponível.' : locationError ? 'Sem localização. Toca para escolher uma região ou tentar novamente.' : 'Escolhe uma localização para calcular distâncias.'}</Text></Pressable> : null}
    {region.municipalityCode ? <Pressable accessibilityRole="button" onPress={() => setPanel('distance')}><Text style={styles.locationNote}>Região selecionada · Alterar localização</Text></Pressable> : null}
    {editorialFilter ? <Text style={styles.help}>{filters.seasonal ? 'A seleção depende da informação sazonal disponível.' : 'Seleção temporária de destaques do Início.'}</Text> : null}
    <View style={styles.resultHeader}>
      <Text accessibilityLiveRegion="polite" style={styles.count}>{results.busy && !results.products.length ? 'A pesquisar…' : count}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Ordenar resultados" style={styles.sort} onPress={() => setPanel('sort')}><Text style={styles.link}>{SORT_OPTIONS.find(([value]) => value === (filters.sortBy || 'recent'))?.[1]}</Text><Ionicons name="chevron-down" size={14} color={colors.primaryDarkFigo} accessible={false} /></Pressable>
      {hasExploreFilters(filters) ? <Pressable accessibilityRole="button" style={styles.sort} onPress={clear}><Text style={styles.link}>Limpar tudo</Text></Pressable> : null}
    </View>
    {results.error ? <View style={styles.feedback}><Text accessibilityRole="alert" style={styles.error}>{results.error}</Text><Button title="Tentar novamente" variant="secondary" onPress={results.retry} /></View> : null}
    {results.busy ? <ActivityIndicator accessibilityLabel="A carregar produtos" color={colors.primaryFigo} /> : null}
    {viewMode === 'list' ? <FlatList key={columns} data={results.products} numColumns={columns} keyExtractor={item => String(item.id)} style={styles.results}
      keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list} columnWrapperStyle={columns > 1 ? styles.row : undefined}
      initialNumToRender={6} maxToRenderPerBatch={6} windowSize={5}
      renderItem={({ item }) => <ProductCard product={item} showBadges style={{ width: cardWidth }} onPress={() => openProduct(item)} />}
      ListEmptyComponent={empty} ListFooterComponent={loadMore} />
      : <View style={styles.results}>
        {results.products.length ? <ExploreMap products={results.products} onProductPress={openProduct} /> : <ScrollView contentContainerStyle={styles.list}>{empty}</ScrollView>}
        {loadMore}
      </View>}
    <ExploreFilterSheet panel={panel} filters={filters} onClose={() => setPanel(null)} onApply={updateFilters} region={region} onRegionChange={setRegion} onLocate={locate} locating={locating} producers={producers} />
  </Screen>;
}
const styles = StyleSheet.create({
  page: { flex: 1, minHeight: 0, paddingTop: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  search: { flexDirection: 'row', alignItems: 'center', gap: 4 }, searchInput: { flex: 1 }, clearSearch: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', borderRadius: 14, padding: 4, backgroundColor: colors.cream }, tab: { flex: 1, minHeight: 44, borderRadius: 11, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, activeTab: { backgroundColor: colors.surface },
  tabText: { color: colors.textMuted, fontWeight: '600' }, activeText: { color: colors.primaryDarkFigo },
  horizontal: { flexGrow: 0, flexShrink: 0 }, chips: { gap: 8, alignItems: 'center' }, chip: { minHeight: 44, justifyContent: 'center' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 12 }, count: { color: colors.text, fontWeight: '700', flexGrow: 1 }, sort: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs }, link: { color: colors.primaryDarkFigo, fontWeight: '600', fontSize: 13 },
  results: { flex: 1, minHeight: 0, gap: 8 }, list: { gap: spacing.md, paddingBottom: spacing.lg, paddingTop: 4 }, row: { gap: spacing.md },
  help: { color: colors.textMuted, fontSize: 12, lineHeight: 17 }, locationNote: { color: colors.primaryDark, fontSize: 12, lineHeight: 17 },
  feedback: { gap: 8 }, error: { color: colors.error, fontSize: 13 },
});
