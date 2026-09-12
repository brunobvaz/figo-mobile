import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import spacing from '../../theme/spacing';
import Screen from '../../components/layout/Screen';
import ProductList from '../../components/product/ProductList';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import useFavorites from '../../hooks/useFavorites';
import useProducts from '../../hooks/useProducts';
import { productService } from '../../services/productService';
import { belongsToSeller, loadOwnProducts, loadFavoriteProducts } from '../../utils/accountProducts';
import { ROUTES } from '../../navigation/routes';

export default function AccountProductsScreen({ navigation, favorites = false }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { favoriteIds, isLoading: favoritesLoading } = useFavorites();
  const { cacheProducts, getProductById } = useProducts();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setItems([]); setError(''); setBusy(true);
    if (!user?.id || (favorites && favoritesLoading)) return () => { active = false; };
    const request = favorites
      ? loadFavoriteProducts(productService, favoriteIds, () => active)
      : loadOwnProducts(productService, user.id, () => active);
    request.then(result => {
      if (!active) return;
      cacheProducts(result); setItems(result);
    }).catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [user?.id, favorites, favoritesLoading, favoriteIds, retry, cacheProducts]));
  const visible = items.map(item => getProductById(item.id)).filter(item => item && (favorites ? favoriteIds.includes(item.id) : belongsToSeller(item, user?.id)));
  return <Screen contentContainerStyle={{ flex: 1, minHeight: 0, paddingTop: 16, paddingBottom: 0, gap: 12 }}>
    {busy ? <ActivityIndicator /> : error ? <>
      <Text>{error}</Text><Button title="Tentar novamente" onPress={() => setRetry(value => value + 1)} />
    </> : visible.length ? <ProductList style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }} products={visible} onProductPress={item => navigation.navigate(ROUTES.PRODUCT_DETAILS, { productId: item.id })} />
      : <Text>{favorites ? 'Ainda não marcaste produtos como favoritos.' : 'Ainda não publicaste anúncios.'}</Text>}
  </Screen>;
}
