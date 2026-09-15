import LoadingIndicator from '../../components/common/LoadingIndicator';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/productService';
import { belongsToSeller } from '../../utils/accountProducts';
import ProductPhotoGallery from '../../components/product/ProductPhotoGallery';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    const { getProductById, cacheProducts, updateProduct, removeProduct } = useProducts();
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);
    const [notice, setNotice] = useState('');
    const productId = route.params.productId;
    useFocusEffect(useCallback(() => {
        let active = true;
        setLoading(true); setError('');
        productService.getById(productId).then(item => { if (active) cacheProducts([item]); })
            .catch(e => { if (active) setError(e.status === 404 ? 'Este anúncio já não está disponível.' : e.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [productId, user?.id, cacheProducts, retry]));
    const product = getProductById(productId);
    if (loading) return <Loading />;
    if (error || !product) return <Screen><Text accessibilityRole="alert">{error || 'Produto não encontrado.'}</Text><Button title="Tentar novamente" onPress={() => setRetry(value => value + 1)} /></Screen>;
    const changeState = async changes => {
        if (savingRef.current) return;
        savingRef.current = true; setSaving(true); setNotice('');
        try { const updated = await updateProduct(product.id, changes); setNotice('is_active' in changes ? (updated.is_active ? 'Anúncio ativo e visível no marketplace.' : 'Anúncio inativo e oculto do marketplace.') : (updated.status === 'sold' ? 'Produto marcado como esgotado.' : 'Produto marcado como disponível.')); }
        catch (e) { Alert.alert('Não foi possível atualizar', e.message); }
        finally { savingRef.current = false; setSaving(false); }
    };
    const confirmStateChange = changes => {
        if (savingRef.current) return;
        const publishing = 'is_active' in changes;
        const enabling = publishing ? changes.is_active : changes.status === 'active';
        const title = publishing
            ? (enabling ? 'Ativar anúncio?' : 'Desativar anúncio?')
            : (enabling ? 'Marcar como disponível?' : 'Marcar como esgotado?');
        const message = publishing
            ? (enabling ? 'O anúncio voltará a aparecer no marketplace.' : 'O anúncio deixará de aparecer no marketplace. Podes reativá-lo quando quiseres.')
            : (enabling ? 'O produto voltará a aparecer como disponível.' : 'O produto ficará identificado como esgotado. O anúncio continuará visível se estiver ativo.');
        const action = publishing
            ? (enabling ? 'Ativar' : 'Desativar')
            : (enabling ? 'Marcar disponível' : 'Marcar esgotado');
        Alert.alert(title, message, [
            { text: 'Cancelar', style: 'cancel' },
            { text: action, onPress: () => changeState(changes) }
        ], { cancelable: true });
    };
    const favorite = isFavorite(product.id);
    const season = SEASONALITY_OPTIONS.find(option => option.value !== 'all_year' && option.value === product.seasonality);
    const isOwner = belongsToSeller(product, user?.id);
    const sellerLocation = formatLocation(product.seller.location).replace(/\b\d{4}\s*-\s*\d{3}\b/g, '').replace(/^[\s,·-]+|[\s,·-]+$/g, '');
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

    return <Screen safeAreaEdges={[]} contentContainerStyle={styles.page}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.lg }} showsVerticalScrollIndicator={false}>
        <View>
        <ProductPhotoGallery key={`${product.id}:${product.imagesRevision}`} photos={product.images || []} title={product.title} />
        <Pressable accessibilityRole="button" accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Guardar nos favoritos'} accessibilityState={{ selected: favorite }} onPress={() => toggleFavorite(product.id)} style={styles.favorite}><Ionicons name={favorite ? 'heart' : 'heart-outline'} size={26} color={colors.primaryDarkFigo} /></Pressable>
        </View>
        <View style={styles.body}>
            {loading ? <LoadingIndicator size="small" /> : null}
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.title}>{product.title}</Text>
            <View style={styles.statusRow}><Text style={[styles.status, product.status === 'sold' && styles.sold]}>{product.status === 'sold' ? 'Esgotado' : 'Disponível'}</Text>{isOwner ? <Text accessibilityLiveRegion="polite" style={[styles.status, product.is_active === false && styles.inactiveStatus]}>{product.is_active === false ? 'Anúncio inativo' : 'Anúncio ativo'}</Text> : null}{product.self_harvest && ['Frutas', 'Legumes'].includes(product.category) ? <Text style={[styles.status, styles.harvestBadge]}>Colher no local</Text> : null}</View>
            <ProductPrice price={product.price} unit={product.unit} large />
            <Text style={styles.heading}>Localização do produto</Text>
            <Text style={styles.meta}>📍 {[product.address?.locality || product.address?.parish, product.address?.municipality].filter(Boolean).join(', ') || formatLocation(product.location)}</Text>
            {product.locationSource === 'parish' ? <Text style={styles.meta}>Localização aproximada · Combina a recolha com o vendedor.</Text> : null}
            {product.self_harvest && ['Frutas', 'Legumes'].includes(product.category) ? <Text style={styles.meta}>Colheita no local: combina os detalhes com o vendedor.</Text> : null}
            <Text style={styles.heading}>Sobre este produto</Text>
            <Text style={styles.description}>{product.description}</Text>
            {season ? <Text style={styles.seasonality}>Época: {season.label}</Text> : null}
            <Pressable accessibilityRole="link" accessibilityLabel={`Ver perfil de ${product.seller.name}`} onPress={() => navigation.navigate('SellerProfile', { sellerId: product.seller.id })} style={styles.seller}>
                <Text style={styles.heading}>Vendedor</Text>
                <View style={styles.sellerRow}>
                    <Avatar uri={product.seller.avatar} name={product.seller.name} size={52} />
                    <View style={styles.sellerCopy}>
                        <Text style={styles.heading}>{product.seller.name}</Text>
                        <Text style={styles.meta}>{sellerLocation}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.primaryDarkFigo} />
                </View>
            </Pressable>
            {isOwner ? <View style={styles.management}>
                <View style={styles.managementHeader}>
                    <Text style={styles.heading}>Gerir anúncio</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Editar produto" disabled={saving} onPress={() => navigation.navigate(ROUTES.EDIT_PRODUCT, { productId: product.id })} style={styles.editLink}>
                        <Ionicons name="create-outline" size={18} color={colors.primaryDarkFigo} /><Text style={styles.editText}>Editar</Text>
                    </Pressable>
                </View>
                <Text style={styles.meta}>A disponibilidade indica se tens produto. Desativar oculta o anúncio do marketplace.</Text>
                <View style={styles.actionRow}>
                    <Pressable accessibilityRole="button" accessibilityLabel={product.status === 'sold' ? 'Marcar como disponível' : 'Marcar como esgotado'} accessibilityState={{ disabled: saving }} disabled={saving} style={[styles.stateAction, product.status === 'sold' ? styles.activate : styles.soldAction, saving && styles.disabled]} onPress={() => confirmStateChange({ status: product.status === 'sold' ? 'active' : 'sold' })}>
                        <Ionicons name={product.status === 'sold' ? 'checkmark-circle-outline' : 'bag-remove-outline'} size={21} color={product.status === 'sold' ? '#24633C' : '#79530B'} />
                        <Text style={[styles.actionText, { color: product.status === 'sold' ? '#24633C' : '#79530B' }]}>{product.status === 'sold' ? 'Marcar disponível' : 'Marcar esgotado'}</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={product.is_active === false ? 'Ativar anúncio' : 'Desativar anúncio'} accessibilityState={{ disabled: saving }} disabled={saving} style={[styles.stateAction, product.is_active === false ? styles.activate : styles.deactivate, saving && styles.disabled]} onPress={() => confirmStateChange({ is_active: product.is_active === false })}>
                        <Ionicons name={product.is_active === false ? 'play-circle-outline' : 'pause-circle-outline'} size={21} color={product.is_active === false ? '#24633C' : '#9A460C'} />
                        <Text style={[styles.actionText, { color: product.is_active === false ? '#24633C' : '#9A460C' }]}>{product.is_active === false ? 'Ativar anúncio' : 'Desativar anúncio'}</Text>
                    </Pressable>
                </View>
                {saving ? <LoadingIndicator size="small" message="A guardar…" /> : notice ? <Text accessibilityLiveRegion="polite" style={styles.meta}>{notice}</Text> : null}
                <Pressable accessibilityRole="button" accessibilityLabel="Remover produto" disabled={saving} onPress={confirmRemoval} style={[styles.removeAction, saving && styles.disabled]}>
                    <Ionicons name="trash-outline" size={18} color="#B4232D" /><Text style={styles.removeText}>Remover produto</Text>
                </Pressable>
            </View> : null}
        </View>
      </ScrollView>
      {!isOwner ? <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}><Button title={product.status === 'sold' ? 'Consultar disponibilidade' : 'Contactar vendedor'} onPress={openChat} /></View> : <View style={{ height: insets.bottom }} />}
    </Screen>;
}

const styles = StyleSheet.create({
    harvestBadge: { color: colors.primaryDarkFigo, backgroundColor: colors.primaryLightFigo },
    page: { paddingHorizontal: 0, paddingBottom: 0 },
    favorite: { position: 'absolute', right: 16, top: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    status: { color: colors.primaryDark, backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, fontWeight: '600' },
    inactiveStatus: { color: '#9A460C', backgroundColor: '#FFF0E3' },
    sold: { color: '#79530B', backgroundColor: '#FFF1CE' },
    management: { gap: spacing.sm },
    managementHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    editLink: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, paddingHorizontal: 4 },
    editText: { color: colors.primaryDarkFigo, fontWeight: '600' },
    actionRow: { flexDirection: 'row', gap: spacing.sm },
    stateAction: { flex: 1, minWidth: 0, minHeight: 76, borderRadius: 12, padding: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
    actionText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
    activate: { backgroundColor: '#E6F3E9' },
    deactivate: { backgroundColor: '#FFF0E3' },
    soldAction: { backgroundColor: '#FFF1CE' },
    disabled: { opacity: 0.5 },
    removeAction: { minHeight: 46, borderRadius: 12, backgroundColor: '#FDEBEC', borderWidth: 1, borderColor: '#EBA5AA', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    removeText: { color: '#B4232D', fontWeight: '600' },
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
});
