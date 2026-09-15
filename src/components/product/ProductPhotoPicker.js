import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OptimizedImage from '../common/OptimizedImage';
import LoadingIndicator from '../common/LoadingIndicator';
import { MAX_PRODUCT_PHOTOS } from '../../utils/productPhotos';
import colors from '../../theme/colors';

export default function ProductPhotoPicker({ photos, onAdd, onRemove, onCover, disabled, loading }) {
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const columns = fontScale > 1.3 || (width > 0 && width < 256) ? 2 : 4;
  const gap = 8;
  const cellWidth = width ? (width - gap * (columns - 1)) / columns : 60;
  const cellHeight = Math.max(94, cellWidth * 1.2);
  return <View style={styles.card}>
    <View style={styles.heading}>
      <Text accessibilityRole="header" style={styles.title}>Fotografias</Text>
      <Text accessibilityLiveRegion="polite" accessibilityLabel={`${photos.length} de 6 fotografias`} style={styles.counter}>{photos.length}/6</Text>
    </View>
    <Text style={styles.subtitle}>Adiciona até 6 fotografias que mostrem bem o produto.</Text>
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={[styles.grid, { gap }]}>
      {Array.from({ length: MAX_PRODUCT_PHOTOS }, (_, index) => {
        const photo = photos[index];
        return photo ? <View key={photo.key} style={[styles.slot, { width: cellWidth, height: cellHeight }]}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Fotografia ${index + 1}${index === 0 ? ', capa do anúncio' : ', definir como capa'}`} accessibilityState={{ disabled, selected: index === 0 }} disabled={disabled} onPress={() => onCover(index)} style={styles.imageButton}>
            <OptimizedImage imageWidth={320} source={{ uri: photo.uri }} resizeMode="cover" style={styles.image} />
            {index === 0 && <View style={styles.cover}><Text style={styles.coverText}>Capa</Text></View>}
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Remover fotografia ${index + 1}`} disabled={disabled} accessibilityState={{ disabled }} hitSlop={4} onPress={() => onRemove(index)} style={[styles.remove, disabled && styles.dimmed]}>
            <Ionicons name="close" size={19} color={colors.text} />
          </Pressable>
        </View> : <Pressable key={`empty-${index}`} accessibilityRole="button" accessibilityLabel={`Adicionar fotografia ${index + 1}`} accessibilityState={{ disabled, busy: loading }} disabled={disabled} onPress={onAdd} style={[styles.empty, { width: cellWidth, minHeight: cellHeight }, disabled && styles.dimmed]}>
          <View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View>
          {loading && index === photos.length ? <LoadingIndicator size="small" /> : <Ionicons name="camera-outline" size={27} color={colors.primaryDarkFigo} />}
          <Text style={styles.addText}>Adicionar{ '\n' }fotografia</Text>
        </Pressable>;
      })}
      <View style={[styles.tips, { width: cellWidth * 2 + gap, minHeight: cellHeight }]}>
        <View style={styles.tipHeading}><Ionicons name="bulb-outline" size={20} color={colors.primaryDarkFigo} /><Text style={styles.tipTitle}>Dicas para boas fotografias</Text></View>
        {['Boa iluminação', 'Mostra vários ângulos', 'Evita fotos desfocadas'].map(tip => <Text key={tip} style={styles.tip}><Text style={styles.bullet}>• </Text>{tip}</Text>)}
      </View>
    </View>
    {photos.length > 1 && <Text style={styles.caption}>Toca numa fotografia para a escolher como capa.</Text>}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#F0EEEB', gap: 8 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#19172C' }, counter: { fontSize: 17, fontWeight: '700', color: colors.primaryDarkFigo },
  subtitle: { fontSize: 13, color: '#80859A', lineHeight: 18, marginBottom: 3 }, grid: { flexDirection: 'row', flexWrap: 'wrap' },
  slot: { borderRadius: 11 }, imageButton: { flex: 1, overflow: 'hidden', borderRadius: 11 }, image: { width: '100%', height: '100%' },
  remove: { position: 'absolute', right: 3, top: 3, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6E1E9' },
  cover: { position: 'absolute', left: 4, bottom: 4, paddingHorizontal: 5, paddingVertical: 3, borderRadius: 5, backgroundColor: colors.primaryDarkFigo }, coverText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  empty: { borderRadius: 11, borderWidth: 1, borderStyle: 'dashed', borderColor: '#BE9ED3', backgroundColor: '#FAF7FC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, paddingTop: 22, paddingBottom: 8, gap: 4 },
  number: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#E6DCEE', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, numberText: { color: colors.primaryDarkFigo, fontSize: 12, fontWeight: '600' },
  addText: { textAlign: 'center', color: '#80859A', fontSize: 11, lineHeight: 15 },
  tips: { borderRadius: 11, backgroundColor: '#F6F0FA', padding: 9, gap: 4, justifyContent: 'center' }, tipHeading: { flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom: 3 },
  tipTitle: { flex: 1, fontSize: 11, lineHeight: 15, color: colors.primaryDarkFigo, fontWeight: '700' }, tip: { color: '#80859A', fontSize: 11, lineHeight: 15 }, bullet: { color: colors.primaryDarkFigo },
  caption: { fontSize: 12, lineHeight: 17, color: '#80859A' }, dimmed: { opacity: 0.5 }
});
