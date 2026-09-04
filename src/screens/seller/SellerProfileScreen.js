import { StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import Screen from '../../components/layout/Screen';
import ProductList from '../../components/product/ProductList';
import { mockSellers } from '../../data/mockUsers';
import useProducts from '../../hooks/useProducts';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { formatDate, formatLocation } from '../../utils/formatters';

export default function SellerProfileScreen({ route, navigation }) {
    
    const { products } = useProducts();
    const seller = mockSellers.find((item) => item.id === route.params.sellerId) || products.find((item) => item.seller.id === route.params.sellerId)?.seller; if (!seller) return <EmptyState title="Vendedor não encontrado" />;
    const sellerProducts = products.filter((item) => item.seller.id === seller.id);

    return <Screen contentContainerStyle={styles.page}>
        <View style={styles.profile}>
            <Avatar uri={seller.avatar} name={seller.name} size={82} />
            <Text style={styles.name}>{seller.name}</Text>
            <Text style={styles.location}>📍 {formatLocation(seller.location)}</Text>
            <Text style={styles.bio}>{seller.bio}</Text>
            <Text style={styles.since}>Na DaTerra desde {formatDate(seller.memberSince)}</Text>
        </View>
        <View style={styles.future}>
            <Text style={styles.futureTitle}>Avaliações · Classificação · Vendas</Text>
            <Text style={styles.futureText}>Disponível numa próxima versão</Text>
        </View>
        <Text style={styles.heading}>Produtos publicados</Text>
        <ProductList products={sellerProducts} onProductPress={(item) => navigation.navigate('ProductDetails', { productId: item.id })} />
    </Screen>
        ;
}

const styles = StyleSheet.create({
    page: { gap: spacing.md },
    profile: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
    name: { color: colors.text, fontSize: 24, fontWeight: '800' },
    location: { color: colors.textMuted },
    bio: { maxWidth: 330, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
    since: { color: colors.primary, fontSize: 12 },
    future: { padding: spacing.md, borderRadius: 14, backgroundColor: colors.cream },
    futureTitle: { color: colors.text, fontWeight: '600', textAlign: 'center' },
    futureText: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 3 },
    heading: { color: colors.text, fontSize: 20, fontWeight: '700' }
});
