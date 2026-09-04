import { StyleSheet } from 'react-native';
import Screen from '../../components/layout/Screen';
import ProductList from '../../components/product/ProductList';
import useFavorites from '../../hooks/useFavorites';
import useProducts from '../../hooks/useProducts';
import spacing from '../../theme/spacing';

export default function FavoritesScreen({ navigation }) {

    const { products } = useProducts();
    const { favoriteIds } = useFavorites();
    const favorites = products.filter((item) => favoriteIds.includes(item.id));

    return <Screen contentContainerStyle={styles.page}>
        <ProductList
            products={favorites}
            onProductPress={(item) => navigation.navigate('ProductDetails', { productId: item.id })} />
    </Screen>
        ;
}

const styles = StyleSheet.create({
    page: {
        paddingTop: spacing.md
    }
});
