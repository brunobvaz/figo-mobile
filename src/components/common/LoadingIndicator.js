import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import useDelayedLoading from '../../hooks/useDelayedLoading';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const sizes = { small: 22, medium: 40, large: 36 };
export default function LoadingIndicator({ size = 'medium', message, loading = true, delay = 250, style, accessibilityLabel = 'A carregar', color }) {
  const visible = useDelayedLoading(loading, delay);
  const [reduced, setReduced] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduced(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { mounted = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    progress.setValue(0);
    if (!visible || reduced) return;
    const animation = Animated.loop(Animated.timing(progress, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true, isInteraction: false }));
    animation.start();
    return () => animation.stop();
  }, [visible, reduced, progress]);
  const width = sizes[size] || sizes.medium;
  return <View style={[styles.container, style]} accessible={visible} accessibilityRole="progressbar" accessibilityLabel={message || accessibilityLabel} accessibilityState={{ busy: loading }} accessibilityLiveRegion="polite">
    <Animated.Image source={require('../../../assets/loading-transparent.png')} resizeMode="contain" style={{ width, height: width, tintColor: color, opacity: !visible ? 0 : reduced ? 1 : progress.interpolate({ inputRange: [0, .5, 1], outputRange: [.8, 1, .8] }), transform: [{ rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }, { scale: progress.interpolate({ inputRange: [0, .5, 1], outputRange: [.96, 1.04, .96] }) }] }} />
    {message ? <Text style={[styles.message, { opacity: visible ? 1 : 0 }]}>{message}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  message: { fontSize: typography.sizes.body, color: colors.textMuted, textAlign: 'center' },
});
