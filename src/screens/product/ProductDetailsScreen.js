import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Screen from '../../components/layout/Screen';
import ProductPrice from '../../components/product/ProductPrice';
import useFavorites from '../../hooks/useFavorites';
import useProducts from '../../hooks/useProducts';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { formatLocation } from '../../utils/formatters';

export default function ProductDetailsScreen({ route, navigation }) {
    const { getProductById, removeProduct } = useProducts();
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const product = getProductById(route.params.productId); if (!product) return <Loading />;
    const favorite = isFavorite(product.id);
    const isOwner = product.seller?.id === user.id;
    const confirmRemoval = () => Alert.alert('Remover produto?', 'O anúncio deixará de aparecer no marketplace.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: async () => { try { await removeProduct(product.id); navigation.goBack(); } catch (error) { Alert.alert('Não foi possível remover', error.message); } } }
    ]);

    const openChat = () => navigation.navigate(ROUTES.CHAT, {
        sellerId: product.seller.id,
        sellerName: product.seller.name,
        productId: product.id,
        productTitle: product.title
    });

    return <Screen scroll contentContainerStyle={styles.page}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.body}>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.title}>{product.title}</Text>
            <ProductPrice price={product.price} unit={product.unit} large />
            <Text style={styles.meta}>📍 {product.location}{product.distance ? ` · ${product.distance}` : ''}</Text>
            <Text style={styles.heading}>Sobre este produto</Text>
            <Text style={styles.description}>{product.description}</Text>
            <View style={styles.seller}><View style={styles.sellerCopy}>
                <Text style={styles.heading}>{product.seller.name}</Text>
                <Text style={styles.meta}>{formatLocation(product.seller.location)}</Text>
            </View>
                <Button title="Ver perfil" variant="secondary" onPress={() => navigation.navigate('SellerProfile', { sellerId: product.seller.id })} />
            </View>
            <Button title={favorite ? 'Remover dos favoritos' : 'Guardar nos favoritos'} variant="secondary" onPress={() => toggleFavorite(product.id)} />
            {!isOwner ? <Button title="Contactar vendedor" onPress={openChat} /> : null}
            {isOwner ? <Button title="Editar produto" variant="secondary" onPress={() => navigation.navigate(ROUTES.EDIT_PRODUCT, { productId: product.id })} /> : null}
            {isOwner ? <Button title="Remover produto" variant="secondary" onPress={confirmRemoval} /> : null}
        </View>
    </Screen>;
}

const styles = StyleSheet.create({
    page: { paddingHorizontal: 0 },
    image: { width: '100%', height: 310, backgroundColor: colors.primaryLightFigo },
    body: { padding: spacing.md, gap: spacing.md },
    category: { color: colors.primaryFigo, fontWeight: '700', textTransform: 'uppercase', fontSize: 12 },
    title: { color: colors.text, fontSize: 28, fontWeight: '800' },
    meta: { color: colors.textMuted },
    heading: { color: colors.text, fontSize: 17, fontWeight: '700' },
    description: { color: colors.textMuted, lineHeight: 23 },
    seller: { padding: spacing.md, borderRadius: 16, backgroundColor: colors.cream, gap: spacing.md },
    sellerCopy: { gap: spacing.xs }
});
