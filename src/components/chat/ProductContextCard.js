import OptimizedImage from '../common/OptimizedImage';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductPrice from '../product/ProductPrice';
import { canOpenConversationProduct } from '../../utils/conversationProduct';
import { formatPrice } from '../../utils/formatters';
import { parsePrice } from '../../utils/price';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function ProductContextCard({ product, title, loading, onPress }) {
  const [failedImage, setFailedImage] = useState(null);
  const available = canOpenConversationProduct(product);
  const clickable = available && !loading;
  const name = product?.title || title || 'Produto indisponível';
  const amount = parsePrice(product?.price);
  const priceLabel = Number.isFinite(amount) ? `${formatPrice(amount)}${product?.unit ? ` por ${product.unit.replace(/^€\s*\/\s*/, '')}` : ''}` : '';
  const status = product?.status === 'sold' ? 'Vendido' : !available ? 'Produto indisponível' : '';
  return <Pressable accessibilityRole={clickable ? 'button' : undefined}
    accessibilityLabel={loading ? 'A carregar produto' : [clickable ? `Ver produto ${name}` : name, available ? priceLabel : '', status].filter(Boolean).join(', ')}
    accessibilityState={{ disabled: !clickable, busy: loading }} disabled={!clickable} onPress={onPress}
    style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
    {product?.image && failedImage !== product.image ? <OptimizedImage imageWidth={160} source={{ uri: product.image }} style={styles.image} onError={() => setFailedImage(product.image)} accessible={false} />
      : <View style={[styles.image, styles.placeholder]}>{loading ? <ActivityIndicator color={colors.primaryFigo} /> : <Ionicons name="leaf-outline" size={25} color={colors.primaryFigo} />}</View>}
    <View style={styles.copy}>
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>{loading ? 'A carregar produto…' : name}</Text>
      {!loading && available ? <ProductPrice price={product.price} unit={product.unit} small /> : null}
      {!loading && status ? <Text numberOfLines={1} style={product?.status === 'sold' ? styles.badge : styles.unavailable}>{status}</Text> : null}
    </View>
    {clickable ? <Ionicons name="chevron-forward" size={20} color={colors.primaryDarkFigo} accessible={false} /> : null}
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { flexShrink: 0, minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.sm, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  image: { width: 52, height: 52, borderRadius: 10, backgroundColor: colors.cream },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text },
  unavailable: { fontSize: typography.sizes.caption, color: colors.textMuted },
  badge: { alignSelf: 'flex-start', color: colors.primaryDarkFigo, backgroundColor: colors.primaryLightFigo, borderRadius: 4, paddingHorizontal: 4, fontSize: 11 },
  pressed: { opacity: 0.75 },
});
