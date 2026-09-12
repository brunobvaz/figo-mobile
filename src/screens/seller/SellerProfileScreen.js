import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import Screen from '../../components/layout/Screen';
import ProductList from '../../components/product/ProductList';
import useProducts from '../../hooks/useProducts';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { formatDate } from '../../utils/formatters';
import { locationLabel, profileLocation } from '../../utils/activeLocation';

export default function SellerProfileScreen({ route, navigation }) {
    
    const insets = useSafeAreaInsets();
    const { products } = useProducts();
    const seller = products.find((item) => item.seller?.id === route.params.sellerId)?.seller; if (!seller) return <EmptyState title="Vendedor não encontrado" />;
    const sellerProducts = products.filter((item) => item.seller?.id === seller.id);
    const memberSince = formatDate(seller.createdAt);

    const header = <View style={styles.header}>
        <View style={styles.profile}>
            <Avatar uri={seller.avatar} name={seller.name} size={82} />
            <Text style={styles.name}>{seller.name}</Text>
            <Text style={styles.location}>📍 {locationLabel(profileLocation(seller.location))}</Text>
            <Text style={styles.bio}>{seller.bio}</Text>
            {memberSince ? <Text style={styles.since}>Na Figo desde {memberSince}</Text> : null}
        </View>
        <View style={styles.future}>
            <Text style={styles.futureTitle}>Avaliações · Classificação · Vendas</Text>
            <Text style={styles.futureText}>Disponível numa próxima versão</Text>
        </View>
        <Text style={styles.heading}>Produtos publicados</Text>
    </View>;
    return <Screen contentContainerStyle={styles.page}>
        <ProductList products={sellerProducts} ListHeaderComponent={header} style={styles.list}
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
            onProductPress={(item) => navigation.navigate('ProductDetails', { productId: item.id })} />
    </Screen>;
}

const styles = StyleSheet.create({
    page: { flex: 1, minHeight: 0, paddingBottom: 0 },
    list: { flex: 1, minHeight: 0 },
    header: { gap: spacing.md },
    profile: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
    name: { color: colors.text, fontSize: 24, fontWeight: '800' },
    location: { color: colors.textMuted },
    bio: { maxWidth: 330, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
    since: { color: colors.primaryFigo, fontSize: 12 },
    future: { padding: spacing.md, borderRadius: 14, backgroundColor: colors.cream },
    futureTitle: { color: colors.text, fontWeight: '600', textAlign: 'center' },
    futureText: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 3 },
    heading: { color: colors.text, fontSize: 20, fontWeight: '700' }
});
