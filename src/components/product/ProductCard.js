import OptimizedImage from '../common/OptimizedImage';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFavorites from '../../hooks/useFavorites';
import colors from '../../theme/colors';
import ProductPrice from './ProductPrice';
import { formatLocation } from '../../utils/formatters';

export default function ProductCard({ product, onPress, compact = false, style, showBadges = false, showChevron = false, showSeller = true, variant }) {
  const [failedImage, setFailedImage] = useState(null);
  const { fontScale } = useWindowDimensions();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const horizontal = compact && fontScale <= 1.3;
  const homeCard = ['featured', 'nearby', 'seasonal'].includes(variant);
  const locality = product.address?.municipality || product.address?.locality || formatLocation(product.location);
  const km = Number.isFinite(product.distanceKm) ? product.distanceKm : Number.isFinite(product.distanceMeters) ? product.distanceMeters / 1000 : null;
  const distance = km != null && km >= 0 ? km < 0.1 ? '< 100 m' : `≈ ${km.toLocaleString('pt-PT', { maximumFractionDigits: 1 })} km` : product.distance;
  const location = variant === 'featured' ? product.address?.locality || locality : distance || locality;
  const seasonal = variant === 'seasonal' || (showBadges && product.seasonal);
  const featured = !seasonal && (variant === 'featured' || (showBadges && product.featured));
  const ribbon = variant === 'featured';
  return <View style={[styles.card, homeCard && styles.homeCard, compact && styles.fullWidth, style]}>
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [horizontal && styles.horizontal, pressed && styles.pressed]}>
    <View style={[styles.imageFrame, homeCard && styles.homeImage, horizontal && styles.horizontalImage]}>
      {product.image && failedImage !== product.image ? <OptimizedImage source={{ uri: product.image }} onError={() => setFailedImage(product.image)} style={styles.image} resizeMode="cover" />
        : <View accessibilityLabel="Imagem indisponível" style={[styles.image, styles.placeholder]}><Ionicons name="leaf-outline" size={32} color={colors.primaryDarkFigo} /></View>}
      {ribbon ? <View pointerEvents="none" style={[styles.ribbon, { width: 160 * Math.max(1, fontScale), left: -42 * Math.max(1, fontScale), top: 25 * Math.max(1, fontScale) }]}>
        <Text style={styles.ribbonText}>Em destaque</Text>
      </View> : null}
    </View>
    <View style={[styles.content, homeCard && styles.homeContent, horizontal && styles.horizontalContent]}>
      {seasonal || (featured && !ribbon) ? <View style={[styles.badge, seasonal && styles.seasonalBadge]}>
        {!homeCard ? <Ionicons accessible={false} name={seasonal ? 'leaf-outline' : 'sparkles-outline'} size={13} color={seasonal ? colors.primaryDark : colors.primaryDarkFigo} /> : null}
        <Text style={[styles.badgeText, seasonal && styles.seasonalText]}>{seasonal ? 'Da época' : 'Destaque'}</Text>
      </View> : null}
      <Text numberOfLines={fontScale > 1.3 ? undefined : homeCard ? 1 : 2} style={[styles.title, homeCard && styles.homeTitle]}>{product.title}</Text>
      <ProductPrice price={product.price} unit={product.unit} small={!horizontal} />
      {location && variant !== 'seasonal' ? <View style={styles.metaRow}>
        <Ionicons accessible={false} name={homeCard ? 'location' : 'location-outline'} size={homeCard ? 13 : 15} color={homeCard ? colors.error : colors.textMuted} />
        <Text numberOfLines={fontScale > 1.3 ? undefined : 1} style={[styles.meta, variant === 'nearby' && styles.nearbyLocation]}>{location}</Text>
      </View> : null}
      {showSeller && product.seller?.name ? <Text numberOfLines={fontScale > 1.3 ? undefined : 1} style={styles.seller}>{product.seller.name}</Text> : null}
    </View>
    {showChevron && horizontal ? <View style={styles.chevron}><Ionicons accessible={false} name="chevron-forward" size={20} color={colors.primaryDarkFigo} /></View> : null}
    </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} accessibilityState={{ selected: favorite }}
        hitSlop={4} onPress={event => { event.stopPropagation(); toggleFavorite(product.id); }} style={[styles.favorite, horizontal && styles.horizontalFavorite]}>
        <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? colors.error : colors.primaryDarkFigo} />
      </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  card: { width: 200, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle },
  homeCard: { borderWidth: 0, borderRadius: 20 },
  fullWidth: { width: '100%' }, horizontal: { flexDirection: 'row' }, pressed: { opacity: 0.8 },
  imageFrame: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.surfaceSoft },
  homeImage: { overflow: 'hidden' },
  horizontalImage: { width: 116, aspectRatio: undefined, minHeight: 132, alignSelf: 'stretch', flexShrink: 0 },
  image: { width: '100%', height: '100%', flex: 1 }, placeholder: { alignItems: 'center', justifyContent: 'center' },
  favorite: { position: 'absolute', right: 8, top: 8, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  horizontalFavorite: { left: 64, right: undefined },
  content: { padding: 12, gap: 7 }, horizontalContent: { flex: 1, minWidth: 0, justifyContent: 'center' },
  homeContent: { padding: 8, gap: 4 },
  title: { color: colors.text, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  homeTitle: { fontSize: 15, lineHeight: 21 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 }, meta: { color: colors.textMuted, fontSize: 13, lineHeight: 19, flex: 1 },
  seller: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  nearbyLocation: { color: colors.primaryDark, fontWeight: '600' },
  ribbon: { position: 'absolute', alignItems: 'center', paddingVertical: 4, backgroundColor: '#EADCF3', transform: [{ rotate: '-45deg' }] },
  ribbonText: { color: colors.primaryDarkFigo, fontSize: 11, lineHeight: 15, fontWeight: '700' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', maxWidth: '100%', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4, backgroundColor: colors.surfaceSoft },
  badgeText: { fontSize: 12, color: colors.primaryDarkFigo, fontWeight: '600', flexShrink: 1 },
  seasonalBadge: { backgroundColor: '#EDF3E9' }, seasonalText: { color: colors.primaryDark },
  chevron: { width: 24, paddingRight: 6, justifyContent: 'center' }
});
