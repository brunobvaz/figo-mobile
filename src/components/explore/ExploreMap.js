import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';
import ProductCard from '../product/ProductCard';
import { locationService } from '../../services/locationService';
import { parishMarkers } from '../../utils/exploreFilters';
import { formatPrice } from '../../utils/formatters';
import colors from '../../theme/colors';

export default function ExploreMap({ products, onProductPress }) {
  const map = useRef(null);
  const cache = useRef(new Map());
  const [parishes, setParishes] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [ready, setReady] = useState(false);
  const municipalityKey = JSON.stringify([...new Set(products.map(item => item.address?.municipalityCode).filter(Boolean))].sort());
  useEffect(() => {
    let active = true;
    const codes = JSON.parse(municipalityKey).filter(code => !cache.current.has(code));
    setLoading(codes.length > 0); setFailed(false);
    Promise.allSettled(codes.map(async code => {
      const response = await locationService.parishes(code);
      cache.current.set(code, response.items);
    })).then(results => {
      if (!active) return;
      setFailed(results.some(result => result.status === 'rejected'));
      setParishes(new Map([...cache.current.values()].flat().map(parish => [parish.code, parish])));
      setLoading(false);
    });
    return () => { active = false; };
  }, [municipalityKey, retry]);
  const markers = useMemo(() => parishMarkers(products, parishes), [products, parishes]);
  const selected = markers.find(marker => marker.id === selectedId);
  const missing = products.length - markers.reduce((total, marker) => total + marker.products.length, 0);
  const coordinateKey = JSON.stringify(markers.map(marker => marker.coordinate));
  useEffect(() => {
    const coordinates = JSON.parse(coordinateKey);
    if (ready && coordinates.length) map.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 50, right: 45, bottom: 80, left: 45 }, animated: true,
    });
  }, [coordinateKey, ready]);
  // Google Maps needs a native API key in standalone Android builds; Expo Go supplies its own.
  if (Platform.OS === 'android' && Constants.executionEnvironment !== 'storeClient'
    && !Constants.expoConfig?.extra?.googleMapsAndroidConfigured) {
    return <View style={styles.container}><Text style={styles.help}>O mapa ainda não está disponível nesta versão. Consulta os produtos na Lista.</Text></View>;
  }
  return <View style={styles.container}>
    <View style={styles.mapArea}>
      <MapView ref={map} style={StyleSheet.absoluteFill} onMapReady={() => setReady(true)}
        initialRegion={{ latitude: 39.5, longitude: -8, latitudeDelta: 6, longitudeDelta: 6 }}
        onPress={() => setSelectedId(null)}>
        {markers.map(marker => <Marker key={marker.id} coordinate={marker.coordinate}
          title={marker.products.length === 1 ? marker.products[0].title : `${marker.products.length} produtos nesta zona`}
          onPress={event => { event.stopPropagation(); setSelectedId(marker.id); }}>
          <View style={[styles.pin, marker.id === selectedId && styles.selectedPin]}><Text style={styles.pinText}>
            {marker.products.length === 1 ? formatPrice(marker.products[0].price) : `${marker.products.length} produtos`}
          </Text></View>
        </Marker>)}
      </MapView>
      <View style={styles.note}>
        {loading ? <ActivityIndicator size="small" color={colors.primaryDarkFigo} /> : null}
        <Text style={styles.help}>{loading ? 'A localizar produtos…' : markers.length ? 'Localizações aproximadas por freguesia' : 'Sem localizações disponíveis para estes produtos.'}</Text>
        {!loading && missing > 0 ? <Text style={styles.help}>{missing} sem pin · disponíveis na Lista</Text> : null}
        {failed ? <Pressable accessibilityRole="button" style={styles.retry} onPress={() => setRetry(value => value + 1)}><Text style={styles.link}>Tentar carregar localizações novamente</Text></Pressable> : null}
      </View>
    </View>
    {selected ? <FlatList horizontal data={selected.products} keyExtractor={item => String(item.id)} showsHorizontalScrollIndicator={false} style={styles.previewList}
      contentContainerStyle={styles.previews} renderItem={({ item }) => <View style={styles.preview}>
        <ProductCard product={item} compact onPress={() => onProductPress(item)} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver produto: ${item.title}`} style={styles.open} onPress={() => onProductPress(item)}><Text style={styles.link}>Ver produto →</Text></Pressable>
      </View>} /> : null}
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, gap: 8 }, mapArea: { flex: 1, minHeight: 0, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.cream },
  pin: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 18, backgroundColor: colors.primaryDarkFigo, borderWidth: 2, borderColor: colors.surface },
  selectedPin: { backgroundColor: colors.primaryDark }, pinText: { color: colors.surface, fontSize: 12, fontWeight: '700' },
  note: { position: 'absolute', top: 8, left: 8, right: 8, borderRadius: 12, padding: 8, gap: 4, backgroundColor: colors.surface },
  help: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  previewList: { flexGrow: 0, maxHeight: 215 }, previews: { gap: 12 }, preview: { width: 280 },
  open: { minHeight: 44, alignItems: 'center', justifyContent: 'center' }, link: { color: colors.primaryDarkFigo, fontWeight: '600' },
  retry: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
});
