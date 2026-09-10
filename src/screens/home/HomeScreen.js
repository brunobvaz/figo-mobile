import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Header from '../../components/layout/Header';
import Screen from '../../components/layout/Screen';
import ProductList from '../../components/product/ProductList';
import HomeFilters, { PRICE_FILTERS } from '../../components/home/HomeFilters';
import { productService } from '../../services/productService';
import { locationService } from '../../services/locationService';
import useAuth from '../../hooks/useAuth';
import useProducts from '../../hooks/useProducts';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { formatLocation } from '../../utils/formatters';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { cacheProducts, getProductById } = useProducts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [sort, setSort] = useState('recent');
  const [radius, setRadius] = useState(25);
  const [nearby, setNearby] = useState(false);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const generation = useRef(0);
  const locationRequest = useRef(0);
  const loadingPage = useRef(false);
  useEffect(() => () => { locationRequest.current++; }, []);
  const toggleNearby = async enabled => {
    const id = ++locationRequest.current;
    if (!enabled) {
      setNearby(false); setLocating(false);
      setSort(current => current === 'distance' ? 'recent' : current);
      return;
    }
    if (coords) { setNearby(true); return; }
    setLocating(true);
    try {
      const position = await locationService.current();
      if (locationRequest.current !== id) return;
      setCoords(position); setNearby(true);
    } catch (e) { if (locationRequest.current === id) Alert.alert('Localização', e.message); }
    finally { if (locationRequest.current === id) setLocating(false); }
  };
  const clear = () => {
    locationRequest.current++; setLocating(false);
    setQuery(''); setCategory(''); setPrice(''); setSort('recent'); setRadius(25); setNearby(false);
  };
  const params = useMemo(() => {
    const range = PRICE_FILTERS.find(item => item.value === price) || {};
    return { search: query.trim(), category, minPrice: range.minPrice, maxPrice: range.maxPrice, sort, ...(nearby ? coords : {}), radiusKm: radius, limit: 20 };
  }, [query, category, price, sort, nearby, coords, radius]);
  const load = useCallback(async (page, id) => {
    if (loadingPage.current) return;
    loadingPage.current = true; setBusy(true); setError('');
    try {
      const response = await productService.page({ ...params, page });
      if (generation.current !== id) return;
      setResults(current => page === 1 ? response.items : [...new Map([...current, ...response.items].map(item => [item.id, item])).values()]);
      setPagination(response.pagination); cacheProducts(response.items);
    } catch (e) { if (generation.current === id) setError(e.message); }
    finally { if (generation.current === id) { setBusy(false); loadingPage.current = false; } }
  }, [params, cacheProducts]);
  useFocusEffect(useCallback(() => {
    const id = ++generation.current;
    loadingPage.current = false;
    setResults([]); setPagination(null); setBusy(true); setError('');
    const timer = setTimeout(() => load(1, id), 250);
    return () => { clearTimeout(timer); generation.current++; };
  }, [load, retry]));
  const filtered = Boolean(query.trim() || category || price || nearby || sort !== 'recent');
  const visible = results.map(item => getProductById(item.id)).filter(Boolean);
  return <Screen scroll contentContainerStyle={styles.page}>
    <Header title={`Olá, ${user.name.split(' ')[0]}`} subtitle="Descobre o que há perto de ti" location={formatLocation(user.location)} right={
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => navigation.navigate(ROUTES.PROFILE)}><Avatar uri={user.avatar} name={user.name} size={48} /></Pressable>
    } />
    <Input leadingIcon="search-outline" accessibilityLabel="Pesquisar produtos locais" placeholder="Pesquisar produtos locais…" value={query} onChangeText={setQuery} returnKeyType="search" />
    <HomeFilters {...{ category, setCategory, price, setPrice, sort, setSort, radius, setRadius, nearby, locating, clear, query }} clearQuery={() => setQuery('')} onNearbyChange={toggleNearby} />
    <View style={styles.sectionHeader}><Text style={styles.title}>{filtered ? 'Produtos encontrados' : 'Produtos recentes'}</Text>{pagination ? <Text style={styles.count}>{pagination.total}</Text> : null}</View>
    {nearby ? <Text style={styles.help}>Distâncias aproximadas em linha reta, até {radius} km.</Text> : null}
    {busy && !results.length ? <ActivityIndicator color={colors.primaryFigo} /> : null}
    {error ? <><Text style={styles.error}>{error}</Text><Button title="Tentar novamente" variant="secondary" onPress={() => pagination ? load(pagination.page + 1, generation.current) : setRetry(value => value + 1)} /></> : null}
    {visible.length ? <ProductList products={visible} horizontal onProductPress={item => navigation.navigate(ROUTES.PRODUCT_DETAILS, { productId: item.id })} />
      : !busy && !error ? <View style={styles.empty}><Text style={styles.title}>Sem produtos</Text><Text style={styles.help}>Não encontrámos produtos com estes filtros.</Text>{filtered ? <Button title="Limpar filtros" variant="secondary" onPress={clear} /> : null}</View> : null}
    {pagination?.page < pagination?.pages && !error ? <Button title="Carregar mais" variant="secondary" loading={busy} onPress={() => load(pagination.page + 1, generation.current)} /> : null}
  </Screen>;
}
const styles = StyleSheet.create({
  page: { paddingTop: spacing.md, gap: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 21, color: colors.text, fontWeight: '700' }, count: { color: colors.textMuted },
  help: { color: colors.textMuted, fontSize: 13, lineHeight: 19 }, error: { color: colors.error }, empty: { paddingVertical: 24, gap: 12, alignItems: 'center' }
});
