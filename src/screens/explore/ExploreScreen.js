import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import LocationSelect from '../../components/common/LocationSelect';
import Chip from '../../components/common/Chip';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Header from '../../components/layout/Header';
import Screen from '../../components/layout/Screen';
import ProductList from '../../components/product/ProductList';
import mockCategories from '../../data/mockCategories';
import { productService } from '../../services/productService';
import { locationService } from '../../services/locationService';
import useProducts from '../../hooks/useProducts';
export default function ExploreScreen({ navigation, route }) {
  const { cacheProducts, getProductById } = useProducts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [coords, setCoords] = useState(null);
  const [radiusKm, setRadius] = useState(25);
  const [municipalityCode, setMunicipality] = useState('');
  const [parishCode, setParish] = useState('');
  const [municipalities, setMunicipalities] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const generation = useRef(0);
  useEffect(() => { if (route.params?.category) setCategory(route.params.category); }, [route.params?.category]);
  useEffect(() => { let active = true; locationService.municipalities().then(r => { if (active) setMunicipalities(r.items); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [retry]);
  useEffect(() => { let active = true; setParishes([]); if (municipalityCode) locationService.parishes(municipalityCode).then(r => { if (active) setParishes(r.items); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [municipalityCode, retry]);
  const params = { search: query, category, ...coords, radiusKm, municipalityCode, parishCode, limit: 20 };
  const load = async (page, id) => {
    setBusy(true); setError('');
    try {
      const response = await productService.page({ ...params, page });
      if (generation.current !== id) return;
      setResults(previous => page === 1 ? response.items : [...previous, ...response.items]);
      setPagination(response.pagination); cacheProducts(response.items);
    } catch (e) { if (generation.current === id) setError(e.message); }
    finally { if (generation.current === id) setBusy(false); }
  };
  useEffect(() => {
    const id = ++generation.current;
    setResults([]); setPagination(null); setBusy(true);
    const timer = setTimeout(() => load(1, id), 250);
    return () => { clearTimeout(timer); generation.current++; };
  }, [query, category, coords, radiusKm, municipalityCode, parishCode, retry]);
  const locate = async () => {
    setLocating(true);
    try { setCoords(await locationService.current()); }
    catch (e) { Alert.alert('Localização', e.message); }
    finally { setLocating(false); }
  };
  return <Screen contentContainerStyle={{ gap: 8 }}>
    <Header title="Explorar" subtitle={`${pagination?.total ?? 0} produtos${coords ? ' por proximidade' : ''}`} />
    <Input placeholder="O que procuras?" value={query} onChangeText={setQuery} />
    <ScrollView horizontal style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
      {mockCategories.map(item => <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />)}
    </ScrollView>
    <Button title={coords ? 'Atualizar localização' : 'Mostrar mais próximos'} loading={locating} onPress={locate} />
    {coords ? <View style={{ flexDirection: 'row', gap: 8 }}>{[5,25,50].map(km => <Chip key={km} label={`${km} km`} selected={radiusKm === km} onPress={() => setRadius(km)} />)}<Chip label="Limpar GPS" onPress={() => setCoords(null)} /></View> : null}
    <LocationSelect label="Concelho" placeholder="Todos os concelhos" items={municipalities} value={municipalityCode} onChange={code => { setMunicipality(code); setParish(''); }} />
    {municipalityCode ? <LocationSelect label="Freguesia" placeholder="Todas as freguesias" items={parishes} value={parishCode} onChange={setParish} /> : null}
    {coords ? <Text>Distâncias em linha reta. Produtos sem coordenadas não aparecem nesta pesquisa.</Text> : null}
    {error ? <><Text>{error}</Text><Button title="Tentar novamente" onPress={() => setRetry(x => x + 1)} /></> : null}
    {busy ? <Text>A carregar produtos…</Text> : null}
    <ProductList products={results.map(item => getProductById(item.id)).filter(Boolean)} onProductPress={item => navigation.navigate('ProductDetails', { productId: item.id })} />
    {pagination?.page < pagination?.pages ? <Button title="Carregar mais" loading={busy} onPress={() => load(pagination.page + 1, generation.current)} /> : null}
  </Screen>;
}
