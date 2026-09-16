import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
export default function ProductFieldHeading({ title, subtitle }) {
  return <View style={styles.heading}>
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  heading: { gap: 6 }, title: { fontSize: 16, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 14, lineHeight: 21, color: colors.textMuted }
});
