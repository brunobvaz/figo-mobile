import { useCallback, useLayoutEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import EmptyState from '../../components/common/EmptyState';
import Screen from '../../components/layout/Screen';
import ProductList from '../../components/product/ProductList';
import ReviewsSheet from '../../components/reviews/ReviewsSheet';
import ProfileCommerceCard from '../../components/profile/ProfileCommerceCard';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { formatDate } from '../../utils/formatters';
import { locationLabel, profileLocation } from '../../utils/activeLocation';

export default function SellerProfileScreen({ route, navigation }) {
    const insets = useSafeAreaInsets();
    const { width, fontScale } = useWindowDimensions();
    const compactBenefits = width < 400 || fontScale > 1.15;
    const [sellerProducts, setSellerProducts] = useState([]);
    const [seller, setSeller] = useState(null);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(0);
    const [loading, setLoading] = useState(true);
    const [reviewsOpen, setReviewsOpen] = useState(false);
    const openProducts = useCallback(() => navigation.push(ROUTES.SELLER_PRODUCTS, {
        sellerName: seller?.name, filters: { sellerId: route.params.sellerId }
    }), [navigation, route.params.sellerId, seller?.name]);
    useLayoutEffect(() => {
        navigation.setOptions({ headerRight: () => seller ? <Pressable accessibilityRole="button" accessibilityLabel="Opções do perfil"
            onPress={() => Alert.alert(seller.name, 'O que queres consultar?', [
                { text: 'Ver avaliações', onPress: () => setReviewsOpen(true) },
                { text: 'Ver todos os produtos', onPress: openProducts },
                { text: 'Cancelar', style: 'cancel' }
            ])} style={styles.options}>
            <Ionicons name="ellipsis-horizontal" size={25} color={colors.primaryDarkFigo} />
        </Pressable> : null });
    }, [navigation, seller, openProducts]);
    useFocusEffect(useCallback(() => {
        let active = true;
        setLoading(true); setSellerProducts([]); setSeller(null); setError(null);
        Promise.all([orderService.profile(route.params.sellerId), productService.list({ sellerId: route.params.sellerId, limit: 3 })])
            .then(([profile, items]) => { if (active) { setSeller(profile); setSellerProducts(items); } })
            .catch(failure => { if (active) setError(failure.message); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; setReviewsOpen(false); };
    }, [route.params.sellerId, attempt]));
    if (loading) return <Loading />;
    if (!seller) return <Screen><EmptyState title="Perfil indisponível" message={error || 'Não foi possível carregar este perfil.'} /><Button title="Tentar novamente" variant="secondary" onPress={() => setAttempt(value => value + 1)} /></Screen>;
    const memberSince = formatDate(seller.createdAt);

    const header = <View style={styles.header}>
        <View style={styles.profile}>
            <View style={styles.avatarFrame}><ProfileAvatar uri={seller.avatar} name={seller.name} size={88} /></View>
            <Text style={styles.name}>{seller.name}</Text>
            <View style={styles.detailRow}>
                <Ionicons accessible={false} name="location-sharp" size={18} color={colors.error} />
                <Text style={styles.location}>{locationLabel(profileLocation(seller.location))}</Text>
            </View>
            {memberSince ? <View style={styles.detailRow}>
                <Ionicons accessible={false} name="leaf-outline" size={15} color={colors.textMuted} />
                <Text style={styles.since}>Na Figo desde {memberSince}</Text>
            </View> : null}
            {seller.bio || sellerProducts.length ? <Text style={styles.bio}>{seller.bio || 'Descobre os produtos deste vendedor e combina a compra diretamente no chat.'}</Text> : null}
        </View>
        <ProfileCommerceCard reputation={seller.reputation} salesCount={seller.salesCount} onReviewsPress={() => setReviewsOpen(true)} />
        <View style={styles.benefits}>
            <ProfileBenefit icon="leaf-outline" label="Produtos locais" green compact={compactBenefits} />
            <ProfileBenefit icon="ribbon-outline" label="Avaliações de compradores" compact={compactBenefits} />
            <ProfileBenefit icon="people-outline" label="Compra direta ao vendedor" compact={compactBenefits} />
        </View>
        <View style={styles.productHeading}>
            <Text accessibilityRole="header" style={styles.heading}>Produtos publicados</Text>
            {sellerProducts.length ? <Pressable accessibilityRole="button" accessibilityLabel={`Ver todos os produtos de ${seller.name}`} onPress={openProducts} style={styles.allProducts}>
                <Text style={styles.allProductsText}>Ver todos</Text><Ionicons accessible={false} name="arrow-forward" size={21} color={colors.primaryDarkFigo} />
            </Pressable> : null}
        </View>
    </View>;
    return <Screen safeAreaEdges={['left', 'right']} contentContainerStyle={styles.page}>
        {reviewsOpen ? <ReviewsSheet key={seller.id} sellerId={seller.id} sellerName={seller.name} onClose={() => setReviewsOpen(false)}
            onOpenProfile={authorId => navigation.push(ROUTES.SELLER_PROFILE, { sellerId: authorId })} /> : null}
        <ProductList products={sellerProducts} ListHeaderComponent={header} style={styles.list} showChevron showSeller={false}
            ListEmptyComponent={<EmptyState title="Sem anúncios disponíveis" message="As avaliações e vendas deste perfil continuam disponíveis." />}
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
            onProductPress={(item) => navigation.navigate(ROUTES.PRODUCT_DETAILS, { productId: item.id })} />
    </Screen>;
}

function ProfileBenefit({ icon, label, green, compact }) {
    return <View style={[styles.benefit, compact && styles.compactBenefit]}>
        <View style={[styles.benefitIcon, green && styles.greenIcon]}>
            <Ionicons accessible={false} name={icon} size={25} color={green ? colors.primaryDark : colors.primaryDarkFigo} />
        </View>
        <Text style={[styles.benefitLabel, compact && styles.compactBenefitLabel]}>{label}</Text>
    </View>;
}

const styles = StyleSheet.create({
    page: { flex: 1, minHeight: 0, paddingBottom: 0, width: '100%', maxWidth: 640, alignSelf: 'center' },
    list: { flex: 1, minHeight: 0 },
    header: { gap: spacing.md, paddingTop: 8 },
    options: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    profile: { alignItems: 'center', gap: 7, paddingHorizontal: spacing.md },
    avatarFrame: { padding: 3, borderRadius: 50, backgroundColor: colors.surface, shadowColor: '#49394D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    name: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
    detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    location: { color: colors.textMuted, fontSize: 15, flexShrink: 1, textAlign: 'center' },
    since: { color: colors.textMuted, fontSize: 13, flexShrink: 1, textAlign: 'center' },
    bio: { maxWidth: 380, marginTop: 3, color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
    benefits: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: '#EAE5EB' },
    benefit: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    compactBenefit: { flexDirection: 'column', alignSelf: 'flex-start', gap: 6 },
    benefitIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3EBF8' },
    greenIcon: { backgroundColor: '#E7F0E6' },
    benefitLabel: { flexShrink: 1, fontSize: 13, lineHeight: 18, color: colors.text },
    compactBenefitLabel: { textAlign: 'center' },
    productHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
    heading: { color: colors.text, fontSize: 20, fontWeight: '700', flexShrink: 1 },
    allProducts: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 },
    allProductsText: { color: colors.primaryDarkFigo, fontSize: 14, fontWeight: '600' }
});
