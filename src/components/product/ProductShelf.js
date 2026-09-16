import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import ProductCard from './ProductCard';

export default function ProductShelf({ products, onProductPress, variant }) {
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  // Keep a glimpse of the next card on phones, with wider cards for larger text.
  const baseWidth = variant === 'featured' ? 176 : 160;
  const cardWidth = Math.max(baseWidth, Math.min(width * (variant === 'featured' ? 0.49 : 0.45), 240)) * Math.max(1, fontScale);
  return <View onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {products.map(item => <ProductCard key={item.id} product={item} variant={variant} showSeller={variant === 'featured'} style={{ width: cardWidth }} onPress={() => onProductPress(item)} />)}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({ row: { gap: 16, paddingBottom: 2 } });
