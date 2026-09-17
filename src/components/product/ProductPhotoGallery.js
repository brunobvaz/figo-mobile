import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import OptimizedImage from '../common/OptimizedImage';
import colors from '../../theme/colors';

export default function ProductPhotoGallery({ photos, title }) {
  const { width: screenWidth } = useWindowDimensions();
  const [width, setWidth] = useState(screenWidth);
  const [index, setIndex] = useState(0);
  const gallery = useRef(null);
  const select = position => { setIndex(position); gallery.current?.scrollTo({ x: width * position, animated: true }); };
  if (!photos.length) return <View style={styles.empty}><Text style={styles.emptyText}>Fotografia indisponível</Text></View>;
  return <View onLayout={event => {
    const next = event.nativeEvent.layout.width;
    if (next !== width) { setWidth(next); setIndex(0); }
  }}>
    <View>
      <ScrollView key={width} ref={gallery} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => setIndex(Math.max(0, Math.min(photos.length - 1, Math.round(event.nativeEvent.contentOffset.x / width))))}>
        {photos.map((photo, position) => <OptimizedImage key={photo.filename || photo.url} imageWidth={1280}
          source={{ uri: photo.uri }} resizeMode="cover" style={[styles.image, { width }]}
          accessible accessibilityLabel={`${title}, fotografia ${position + 1} de ${photos.length}`} />)}
      </ScrollView>
      {photos.length > 1 && <View pointerEvents="none" style={styles.count}><Text accessibilityLiveRegion="polite" style={styles.countText}>{index + 1}/{photos.length}</Text></View>}
    </View>
    {photos.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>
      {photos.map((photo, position) => <Pressable key={photo.filename || photo.url} accessibilityRole="button" accessibilityLabel={`Ver fotografia ${position + 1} de ${photos.length}`}
        accessibilityState={{ selected: position === index }} onPress={() => select(position)} style={[styles.thumbnailButton, position === index && styles.selected]}>
        <OptimizedImage imageWidth={160} source={{ uri: photo.uri }} resizeMode="cover" style={styles.thumbnail} />
      </Pressable>)}
    </ScrollView>}
  </View>;
}
const styles = StyleSheet.create({
  image: { aspectRatio: 4 / 3, backgroundColor: colors.surface },
  count: { position: 'absolute', bottom: 12, right: 16, backgroundColor: '#30263BD9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 }, countText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  thumbnails: { padding: 12, gap: 8 }, thumbnailButton: { borderWidth: 2, borderColor: 'transparent', padding: 2, borderRadius: 12 }, selected: { borderColor: colors.primaryDarkFigo }, thumbnail: { height: 54, width: 54, borderRadius: 8 },
  empty: { height: 220, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }, emptyText: { color: colors.textMuted }
});
