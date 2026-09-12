import OptimizedImage from '../../components/common/OptimizedImage';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/common/Avatar';
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
import { SEASONALITY_OPTIONS } from '../../utils/productSeasonality';

export default function ProductDetailsScreen({ route, navigation }) {
    const { getProductById, removeProduct } = useProducts();
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const product = getProductById(route.params.productId); if (!product) return <Loading />;
    const favorite = isFavorite(product.id);
    const season = SEASONALITY_OPTIONS.find(option => option.value !== 'all_year' && option.value === product.seasonality);
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
        <OptimizedImage imageWidth={1280} source={{ uri: product.image }} style={styles.image} />
        <View style={styles.body}>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.title}>{product.title}</Text>
            <ProductPrice price={product.price} unit={product.unit} large />
            <Text style={styles.meta}>📍 {product.location}{product.locationSource === 'parish' ? ' · Localização aproximada' : ''}{product.distance ? ` · ${product.distance}` : ''}</Text>
            <Text style={styles.heading}>Sobre este produto</Text>
            <Text style={styles.description}>{product.description}</Text>
            {season ? <Text style={styles.seasonality}>Época: {season.label}</Text> : null}
            <View style={styles.seller}>
                <Text style={styles.heading}>Vendedor</Text>
                <View style={styles.sellerRow}>
                    <Avatar uri={product.seller.avatar} name={product.seller.name} size={52} />
                    <View style={styles.sellerCopy}>
                        <Text style={styles.heading}>{product.seller.name}</Text>
                        <Text style={styles.meta}>{formatLocation(product.seller.location)}</Text>
                    </View>
                        <Pressable
                            accessibilityRole="link"
                            accessibilityLabel={`Ver perfil de ${product.seller.name}`}
                            onPress={() => navigation.navigate('SellerProfile', { sellerId: product.seller.id })}
                            style={({ pressed }) => [styles.profileLink, pressed && { opacity: 0.65 }]}
                        >
                            <Text style={styles.profileLinkText}>Ver perfil</Text>
                        </Pressable>
                </View>
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
    seasonality: { color: colors.primaryDark, fontWeight: '600', lineHeight: 23 },
    seller: { padding: spacing.md, borderRadius: 16, backgroundColor: colors.surface, gap: spacing.md },
    sellerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    sellerCopy: { flex: 1, gap: spacing.xs },
    profileLink: { flexShrink: 0, minHeight: 44, justifyContent: 'center' },
    profileLinkText: { color: colors.primaryDarkFigo, fontWeight: '600', fontSize: 14, textDecorationLine: 'underline' }
});
