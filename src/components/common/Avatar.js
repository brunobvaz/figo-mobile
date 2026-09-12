import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import OptimizedImage from './OptimizedImage';
import colors from '../../theme/colors';

export default function Avatar({ uri, name = '', size = 52 }) {
  const [failedUri, setFailedUri] = useState(null);
  const box = { width: size, height: size, borderRadius: size / 2 };
  return <View style={[styles.fallback, box]}>
    <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase()}</Text>
    {uri && failedUri !== uri ? <OptimizedImage imageWidth={size > 64 ? 320 : 160} source={{ uri }}
      style={[styles.image, box]} onError={() => setFailedUri(uri)} /> : null}
  </View>;
}
const styles = StyleSheet.create({
  image: { position: 'absolute', top: 0, left: 0 },
  fallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.primaryDark, fontWeight: '700' },
});
