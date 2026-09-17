import ListSkeleton from '../../components/common/ListSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/common/Input';
import Header from '../../components/layout/Header';
import Screen from '../../components/layout/Screen';
import ProductShelf from '../../components/product/ProductShelf';
import ProducerCard from '../../components/product/ProducerCard';
import HomeLocationSheet from '../../components/home/HomeLocationSheet';
import { useActiveLocation } from '../../context/ActiveLocationContext';
import useExploreProducts from '../../hooks/useExploreProducts';
import useActiveScreen from '../../hooks/useActiveScreen';
import { locationLabel } from '../../utils/activeLocation';
import { currentProductSeason, isExplicitlyInSeason } from '../../utils/productSeasonality';
import HomeDiscover from '../../components/home/HomeDiscover';
import useAuth from '../../hooks/useAuth';
import useProducts from '../../hooks/useProducts';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { discoveryProducts, quickCategories } from '../../utils/homeDiscovery';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { fontScale } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(0);
  const categoryWidth = Math.max(52 * Math.max(1, fontScale), (contentWidth - 30) / 6);
  const { homeProducts: products, isLoading, refreshProducts, refreshError } = useProducts();
  const active = useActiveScreen();
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (!active) return;
    refreshProducts();
    const timer = setInterval(refreshProducts, 30000);
    return () => clearInterval(timer);
  }, [active, refreshProducts]);
  const [query, setQuery] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const { activeLocation, coordinates, region, locating, error: locationError } = useActiveLocation();
  const currentSeason = currentProductSeason();
  const feed = useMemo(() => discoveryProducts(products), [products]);
  const featuredResults = useExploreProducts({ featured: true }, null, {});
  const nearbyFilters = { radiusKm: 10, sortBy: 'distance', viewMode: 'list' };
  const nearbyResults = useExploreProducts(nearbyFilters, coordinates, region, Boolean(coordinates || region.municipalityCode));
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try { await Promise.all([refreshProducts(), featuredResults.refresh(), nearbyResults.refresh()]); }
    finally { setRefreshing(false); }
  }, [refreshProducts, featuredResults.refresh, nearbyResults.refresh]);
  const nearby = nearbyResults.products;
  const producers = useMemo(() => [...new Map(feed.filter(item => item.seller?.id)
    .map(item => [item.seller.id, item.seller])).values()], [feed]);
  // Each shortcut replaces the complete filter payload, avoiding stale tab filters.
  const explore = (filters = {}) => navigation.navigate(ROUTES.EXPLORE, { filters });
  const openProduct = item => navigation.navigate(ROUTES.PRODUCT_DETAILS, { productId: item.id });
  const sectionHeader = (title, onPress) => <View style={styles.sectionHeader}>
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    {onPress ? <Pressable accessibilityRole="button" accessibilityLabel={`Ver todos: ${title}`} onPress={onPress} style={styles.viewAll}>
      <Text style={styles.link}>Ver todos</Text><Ionicons accessible={false} name="arrow-forward" size={18} color={colors.primaryDarkFigo} />
    </Pressable> : null}
  </View>;
  const productSection = (title, items, filters, variant) => items.length ? <View style={[styles.section, styles[variant]]}>
    {sectionHeader(title, () => explore(filters))}
    <ProductShelf products={items} variant={variant} onProductPress={openProduct} />
  </View> : null;
  return <Screen scroll contentContainerStyle={styles.page} refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primaryDarkFigo} colors={[colors.primaryDarkFigo]} />
  }>
    <Header title={`Olá, ${user?.name?.split(' ')[0] || 'vizinho'}`} subtitle="Descobre o que há perto de ti" location={locationLabel(activeLocation)} onLocationPress={() => setLocationOpen(true)} right={
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => navigation.navigate(ROUTES.PROFILE)}><Avatar uri={user?.avatar} name={user?.name || ''} size={48} /></Pressable>
    } />
    <HomeLocationSheet visible={locationOpen} onClose={() => setLocationOpen(false)} />
    {locating ? <Text accessibilityLiveRegion="polite" style={styles.help}>A obter localização…</Text> : null}
    {locationError ? <Text accessibilityRole="alert" style={styles.help}>{locationError}</Text> : null}
    <Input leadingIcon="search-outline" accessibilityLabel="Pesquisar produtos locais" placeholder="Pesquisar produtos locais..." value={query} onChangeText={setQuery} returnKeyType="search" onSubmitEditing={() => explore({ query: query.trim() })} />
    <View onLayout={event => setContentWidth(event.nativeEvent.layout.width)}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
      {quickCategories.map(([name, emoji]) => <Pressable key={name} accessibilityRole="button" accessibilityLabel={name} style={[styles.category, { width: categoryWidth }]} onPress={() => explore(name === 'Mais' ? {} : { category: name })}>
        <Text accessible={false} style={styles.categoryEmoji}>{emoji}</Text><Text style={styles.categoryLabel}>{name}</Text>
      </Pressable>)}
    </ScrollView></View>
    {isLoading && !feed.length ? <ListSkeleton product rows={2} label="A carregar produtos" /> : null}
    {refreshError ? <Pressable accessibilityRole="button" onPress={refreshProducts}><Text style={styles.help}>{refreshError}</Text></Pressable> : null}
    {productSection('Produtos em destaque', featuredResults.products, { featured: true }, 'featured')}
    {featuredResults.error ? <Pressable accessibilityRole="button" onPress={featuredResults.retry}><Text style={styles.help}>Não foi possível carregar os destaques. Toca para tentar novamente.</Text></Pressable> : null}
    {productSection('Perto de ti', nearby, nearbyFilters, 'nearby')}
    {nearbyResults.error ? <Pressable accessibilityRole="button" onPress={nearbyResults.retry}><Text style={styles.help}>Não foi possível carregar os produtos próximos. Toca para tentar novamente.</Text></Pressable> : null}
    {productSection('Da época', feed.filter(item => isExplicitlyInSeason(item, currentSeason)), { season: currentSeason }, 'seasonal')}
    {producers.length ? <View style={[styles.section, styles.sellers]}>
      {sectionHeader('Vendedores em destaque')}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.producers}>
        {producers.map(item => <ProducerCard key={item.id} producer={item} style={{ width: 264 * Math.max(1, fontScale) }} onPress={() => navigation.navigate(ROUTES.SELLER_PROFILE, { sellerId: item.id })} />)}
      </ScrollView>
    </View> : null}
    {!isLoading && !feed.length && !featuredResults.busy && !featuredResults.products.length ? <EmptyState title="Há espaço para os teus produtos" message="Publica o primeiro anúncio e partilha o que tens para vender." actionLabel="Publicar anúncio" onAction={() => navigation.navigate(ROUTES.SELL)} /> : null}
    <HomeDiscover />
  </Screen>;
}
const styles = StyleSheet.create({
  page: { paddingTop: spacing.md, gap: spacing.md },
  section: { gap: spacing.sm, marginHorizontal: -8, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 12, borderRadius: 22, overflow: 'hidden' },
  featured: { backgroundColor: '#FFEA99' },
  nearby: { backgroundColor: '#EDE9FE' },
  seasonal: { backgroundColor: '#D1FAE5' },
  sellers: { backgroundColor: '#FCE7F3' },
  sectionHeader: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 21, color: colors.text, fontWeight: '700', flexShrink: 1 },
  viewAll: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 },
  link: { color: colors.primaryDarkFigo, fontWeight: '600', fontSize: 14 },
  help: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  producers: { gap: spacing.md, paddingTop: 6, paddingBottom: 2 },
  categories: { flexDirection: 'row', gap: 6 },
  category: { minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 16, backgroundColor: '#F6F2E7' },
  categoryEmoji: { fontSize: 26, lineHeight: 32, color: colors.text },
  categoryLabel: { fontSize: 11, color: colors.text, textAlign: 'center', fontWeight: '500' },
});
