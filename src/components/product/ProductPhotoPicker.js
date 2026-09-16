import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OptimizedImage from '../common/OptimizedImage';
import LoadingIndicator from '../common/LoadingIndicator';
import { MAX_PRODUCT_PHOTOS } from '../../utils/productPhotos';
import colors from '../../theme/colors';

export default function ProductPhotoPicker({ photos, onAdd, onRemove, onCover, disabled, loading, error }) {
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const columns = fontScale > 1.3 || (width > 0 && width < 280) ? 2 : 3;
  const cellWidth = width ? (width - 12 * (columns - 1)) / columns : 96;
  const photo = photos[0];
  const remove = index => <Pressable accessibilityRole="button" accessibilityLabel={`Remover fotografia ${index + 1}`} disabled={disabled} accessibilityState={{ disabled }}
    onPress={() => onRemove(index)} style={[styles.remove, disabled && styles.dimmed]}><Ionicons accessible={false} name="close" size={22} color={colors.text} /></Pressable>;
  return <View style={[styles.card, error && styles.errorBorder]}>
    <View style={styles.heading}>
      <Text accessibilityRole="header" style={styles.title}>Fotografias</Text>
      <Text accessibilityLiveRegion="polite" accessibilityLabel={`${photos.length} de 6 fotografias`} style={styles.counter}>{photos.length}/6</Text>
    </View>
    <Text style={styles.subtitle}>A fotografia principal aparece nos cartões do teu anúncio.</Text>
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={styles.photos}>
      {photo ? <View style={styles.coverFrame}>
        <OptimizedImage source={{ uri: photo.uri }} resizeMode="cover" style={styles.coverImage} />
        <View style={styles.coverBadge}><Ionicons accessible={false} name="image-outline" size={16} color={colors.surface} /><Text style={styles.coverText}>Fotografia principal</Text></View>
        {remove(0)}
      </View> : <Pressable accessibilityRole="button" accessibilityLabel="Adicionar fotografia principal" accessibilityState={{ disabled, busy: loading }} disabled={disabled}
        onPress={onAdd} style={[styles.coverEmpty, disabled && styles.dimmed]}>
        {loading ? <LoadingIndicator /> : <Ionicons accessible={false} name="camera-outline" size={36} color={colors.primaryDarkFigo} />}
        <Text style={styles.addTitle}>Adicionar fotografia principal</Text><Text style={styles.caption}>Até 6 fotografias por anúncio</Text>
      </Pressable>}
      {photos.length ? <View style={styles.grid}>
        {photos.slice(1).map((item, offset) => <View key={item.key} style={[styles.slot, { width: cellWidth, height: Math.max(112, cellWidth) }]}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Fotografia ${offset + 2}, definir como capa`} accessibilityState={{ disabled }} disabled={disabled} onPress={() => onCover(offset + 1)} style={styles.imageButton}>
            <OptimizedImage imageWidth={320} source={{ uri: item.uri }} resizeMode="cover" style={styles.image} />
          </Pressable>
          {remove(offset + 1)}
        </View>)}
        {photos.length < MAX_PRODUCT_PHOTOS ? <Pressable accessibilityRole="button" accessibilityLabel="Adicionar mais fotografias" accessibilityState={{ disabled, busy: loading }} disabled={disabled} onPress={onAdd}
          style={[styles.empty, { width: cellWidth, minHeight: Math.max(112, cellWidth) }, disabled && styles.dimmed]}>
          {loading ? <LoadingIndicator size="small" /> : <Ionicons accessible={false} name="add" size={28} color={colors.primaryDarkFigo} />}
          <Text style={styles.addText}>Adicionar</Text>
        </Pressable> : null}
      </View> : null}
    </View>
    {photos.length > 1 ? <Text style={styles.caption}>Toca numa fotografia pequena para a escolher como principal.</Text> : null}
    <View style={styles.tip}><Ionicons accessible={false} name="sunny-outline" size={20} color={colors.primaryDarkFigo} /><Text style={styles.tipText}>Usa boa luz e mostra o produto de vários ângulos.</Text></View>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, gap: 12 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text }, counter: { fontSize: 15, fontWeight: '600', color: colors.primaryDarkFigo },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 21 }, photos: { gap: 12 },
  coverFrame: { width: '100%', aspectRatio: 16 / 10, borderRadius: 14, overflow: 'hidden' }, coverImage: { width: '100%', height: '100%' },
  coverBadge: { position: 'absolute', left: 12, bottom: 12, right: 12, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 8, backgroundColor: colors.primaryDarkFigo },
  coverText: { fontSize: 13, fontWeight: '600', color: colors.surface, flexShrink: 1 },
  coverEmpty: { minHeight: 180, padding: 20, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primaryFigo, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center', gap: 12 },
  addTitle: { fontSize: 16, fontWeight: '600', color: colors.primaryDarkFigo, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, slot: { borderRadius: 12 },
  imageButton: { flex: 1, overflow: 'hidden', borderRadius: 12 }, image: { width: '100%', height: '100%' },
  remove: { position: 'absolute', right: 4, top: 4, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle },
  empty: { borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primaryFigo, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center', padding: 8, gap: 8 },
  addText: { textAlign: 'center', color: colors.primaryDarkFigo, fontSize: 14, fontWeight: '600' },
  tip: { flexDirection: 'row', gap: 8, paddingTop: 4 }, tipText: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  caption: { fontSize: 13, lineHeight: 19, color: colors.textMuted, textAlign: 'center' },
  dimmed: { opacity: 0.5 }, errorBorder: { borderColor: colors.error }, error: { fontSize: 13, lineHeight: 19, color: colors.error }
});
