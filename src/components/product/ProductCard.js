import OptimizedImage from '../common/OptimizedImage';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFavorites from '../../hooks/useFavorites';
import colors from '../../theme/colors';
import shadows from '../../theme/shadows';
import spacing from '../../theme/spacing';
import ProductPrice from './ProductPrice';
import { formatLocation } from '../../utils/formatters';

/** @typedef {'featured'|'nearby'|'seasonal'} ProductCardVariant */

export default function ProductCard({ product, onPress, compact = false, style, showBadges = false, variant }) {
    const [failedImage, setFailedImage] = useState(null);
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorite = isFavorite(product.id);
    // Explicit Home variants leave existing list/map/detail consumers unchanged.
    const homeVariant = !compact && ['featured', 'nearby', 'seasonal'].includes(variant);
    const seasonal = homeVariant && variant === 'seasonal';
    const nearby = homeVariant && variant === 'nearby';
    const locality = product.address?.locality || formatLocation(product.location);
    const distance = Number.isFinite(product.distanceKm) && product.distanceKm >= 0
        ? `${product.distanceKm.toLocaleString('pt-PT', { maximumFractionDigits: 1 })} km`
        : product.distance || (Number.isFinite(product.distanceMeters) && product.distanceMeters >= 0
            ? `${(product.distanceMeters / 1000).toLocaleString('pt-PT', { maximumFractionDigits: 1 })} km` : '');
    const imageStyle = [styles.image, homeVariant && (variant === 'featured' ? styles.featuredImage : styles.smallImage), compact && styles.compactImage];
    const administrativeLocation = [product.address?.municipality, product.address?.parish].filter(Boolean).join(' · ');
    const locationNote = [product.locationSource === 'parish' ? 'Localização aproximada' : '', ].filter(Boolean).join(' · ');

    return <Pressable onPress={onPress} style={[styles.card, homeVariant && (variant === 'featured' ? styles.featuredCard : styles.smallCard), compact && styles.compact, style]}>
        <View>{product.image && failedImage !== product.image ? <OptimizedImage
            source={{ uri: product.image }}
            onError={() => setFailedImage(product.image)}
            style={imageStyle}
        /> : <View accessibilityLabel="Imagem indisponível" style={[imageStyle, styles.placeholder]}><Ionicons name="leaf-outline" size={32} color={colors.primaryDarkFigo} /></View>}
            {homeVariant && variant === 'featured' ? <View pointerEvents="none" style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>Em destaque</Text>
            </View> : null}
            <Pressable
                accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                hitSlop={8}
                onPress={(event) => { event.stopPropagation(); toggleFavorite(product.id); }}
                style={styles.favorite}>
                <Ionicons
                    name={favorite ? 'heart' : 'heart-outline'}
                    size={21}
                    color={favorite ? colors.error : colors.primaryDarkFigo} />
            </Pressable>
        </View>
        <View style={[styles.content, homeVariant && styles.homeContent]}>
            {(seasonal || showBadges) && (seasonal || product.seasonal || product.featured) ? <View style={styles.badges}>
                {seasonal || product.seasonal ? <Text style={styles.badge}>Da época</Text> : null}
                {!seasonal && product.featured ? <Text style={[styles.badge, styles.highlightBadge]}>Destaque</Text> : null}
            </View> : null}
            <Text
                numberOfLines={1}
                style={[styles.title, homeVariant && styles.homeTitle]}>
                {product.title}
            </Text>
            <ProductPrice
                price={product.price}
                unit={product.unit}
                small={homeVariant} />
            {!seasonal ? <Text
                numberOfLines={1}
                style={[styles.meta, homeVariant && styles.homeMeta, nearby && styles.distance]}>
                📍 {homeVariant && variant === 'featured' ? locality : distance || locality}
            </Text> : null}
            {!homeVariant && administrativeLocation ? <Text numberOfLines={1} style={styles.meta}>
                <Ionicons name="map-outline" size={12} color={colors.textMuted} /> {administrativeLocation}
            </Text> : null}
            {!homeVariant && locationNote ? <Text numberOfLines={1} style={styles.meta}>
                {locationNote}
            </Text> : null}
            {!nearby && !seasonal ? <Text
                numberOfLines={1}
                style={[styles.seller, homeVariant && styles.homeMeta]}>
                {product.seller?.name || ''}
            </Text> : null}
        </View>
    </Pressable>
        ;
}

const styles = StyleSheet.create({
    featuredBadge: { position: 'absolute', left: -40, top: 20, width: 140, paddingVertical: spacing.xs, alignItems: 'center', backgroundColor: colors.primaryLightFigo, transform: [{ rotate: '-45deg' }] },
    featuredBadgeText: { color: colors.primaryDarkFigo, fontSize: 10, fontWeight: '700' },
    featuredCard: { width: 176 },
    smallCard: { width: 160 },
    featuredImage: { height: undefined, aspectRatio: 4 / 3 },
    smallImage: { height: undefined, aspectRatio: 10 / 7 },
    homeContent: { padding: spacing.sm, gap: spacing.xs },
    homeTitle: { fontSize: 14, lineHeight: 18 },
    homeMeta: { fontSize: 11, lineHeight: 14, color: colors.textMuted, fontWeight: '400' },
    distance: { color: colors.primaryDark, fontWeight: '600', fontSize: 12, lineHeight: 16 },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    badge: { fontSize: 10, color: colors.primaryDark, backgroundColor: colors.primaryLight, padding: 4, borderRadius: 6 },
    highlightBadge: { backgroundColor: '#FFEA99', color: colors.text },
    placeholder: { alignItems: 'center', justifyContent: 'center' },
    card: {
        width: 238,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor:
            colors.surface,
        ...shadows.card
    },
    compact: {
        width: '100%',
        flexDirection: 'row'
    }, image: {
        width: '100%',
        height: 142,
        backgroundColor: colors.primaryLightFigo
    },
    compactImage: {
        width: 120,
        height: 132
    },
    favorite: {
        position: 'absolute',
        right: spacing.sm,
        top: spacing.sm,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface,
        alignItems: 'center', justifyContent: 'center'
    },
    content: {
        flex: 1,
        padding: spacing.md, gap: 5
    },
    title: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '700'
    },
    meta: {
        color: colors.textMuted,
        fontSize: 12
    },
    seller: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '500'
    }
});
