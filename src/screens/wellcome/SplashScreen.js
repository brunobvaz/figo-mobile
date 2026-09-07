import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import * as NativeSplashScreen from 'expo-splash-screen';
import colors from '../../theme/colors';

export default function SplashScreen({ onReady }) {
  const [layoutReady, setLayoutReady] = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [logoReady, setLogoReady] = useState(false);

  useEffect(() => {
    if (!layoutReady || !backgroundReady || !logoReady) return;
    // Reveal the custom screen only once its two images have been rendered.
    const frame = requestAnimationFrame(() => {
      NativeSplashScreen.hideAsync().catch(console.warn).finally(() => onReady?.());
    });
    return () => cancelAnimationFrame(frame);
  }, [layoutReady, backgroundReady, logoReady, onReady]);

  return (
    <View style={styles.screen} onLayout={() => setLayoutReady(true)}>
      <Image
        source={require('../../../assets/splash-mobile-transparent.png')}
        style={styles.background}
        resizeMode="cover"
        onLoadEnd={() => setBackgroundReady(true)}
        accessible={false}
      />
      <Image
        source={require('../../../assets/splash-icon.png')}
        style={styles.logo}
        resizeMode="contain"
        onLoadEnd={() => setLogoReady(true)}
        accessibilityLabel="FiGO"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  logo: { width: 200, height: 200 },
});
