import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFavorites from '../../hooks/useFavorites';
import colors from '../../theme/colors';
import shadows from '../../theme/shadows';
import spacing from '../../theme/spacing';
import ProductPrice from './ProductPrice';

export default function ProductCard({ product, onPress, compact = false }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorite = isFavorite(product.id);
    const locality = product.address?.locality || product.location;
    const administrativeLocation = [product.address?.municipality, product.address?.parish].filter(Boolean).join(' · ');
    const locationNote = [product.locationSource === 'parish' ? 'Localização aproximada' : '', product.distance].filter(Boolean).join(' · ');

    return <Pressable onPress={onPress} style={[styles.card, compact && styles.compact]}>
        <View><Image
            source={{ uri: product.image }}
            style={[styles.image, compact && styles.compactImage]}
        />
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
        <View style={styles.content}>
            <Text
                numberOfLines={1}
                style={styles.title}>
                {product.title}
            </Text>
            <ProductPrice
                price={product.price}
                unit={product.unit} />
            <Text
                numberOfLines={1}
                style={styles.meta}>
                📍 {locality}
            </Text>
            {administrativeLocation ? <Text numberOfLines={1} style={styles.meta}>
                <Ionicons name="map-outline" size={12} color={colors.textMuted} /> {administrativeLocation}
            </Text> : null}
            {locationNote ? <Text numberOfLines={1} style={styles.meta}>
                {locationNote}
            </Text> : null}
            <Text
                numberOfLines={1}
                style={styles.seller}>
                {product.seller.name}
            </Text>
        </View>
    </Pressable>
        ;
}

const styles = StyleSheet.create({
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
