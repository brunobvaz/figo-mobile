import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function EventPoster({ image, title }) {
  const window = useWindowDimensions();
  const [width, setWidth] = useState(window.width);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;
  const fullHeight = width * 5 / 4;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(expanded ? 1 : 0);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: expanded ? 1 : 0,
      duration: 360,
      easing: Easing.inOut(Easing.cubic),
      // Animate layout height so the details move with the poster.
      useNativeDriver: false
    });
    animation.start();
    return () => animation.stop();
  }, [expanded, reducedMotion, progress]);

  if (!image || failed) return null;
  return <Animated.View onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}
    style={[styles.frame, { height: progress.interpolate({ inputRange: [0, 1], outputRange: [fullHeight / 2, fullHeight] }) }]}>
    <Image source={{ uri: image }} accessibilityLabel={`Cartaz de ${title}`} resizeMode="contain"
      style={[styles.image, { height: fullHeight }]} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
    {loaded && <Pressable accessibilityRole="button" accessibilityLabel={expanded ? 'Recolher cartaz' : 'Expandir cartaz'}
      accessibilityState={{ expanded }} accessibilityHint={expanded ? 'Volta a mostrar metade do cartaz.' : 'Mostra o cartaz completo antes das informações do evento.'}
      onPress={() => setExpanded(value => !value)} style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}>
      <Ionicons accessible={false} name={expanded ? 'chevron-up' : 'expand-outline'} size={18} color={colors.surface} />
      <Text style={styles.label}>{expanded ? 'Recolher' : 'Expandir'}</Text>
    </Pressable>}
  </Animated.View>;
}
const styles = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden', backgroundColor: colors.surfaceSoft },
  image: { position: 'absolute', top: 0, left: 0, width: '100%' },
  toggle: { position: 'absolute', top: spacing.md, right: spacing.md, minHeight: 44, paddingVertical: 10, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: 24, backgroundColor: 'rgba(32, 24, 40, 0.88)' },
  pressed: { opacity: 0.8 },
  label: { color: colors.surface, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold }
});
