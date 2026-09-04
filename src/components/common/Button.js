import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors'; import spacing from '../../theme/spacing'; import typography from '../../theme/typography';
export default function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
  const secondary = variant === 'secondary';
  return <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, pressed && styles.pressed, (disabled || loading) && styles.disabled, style]}>{loading ? <ActivityIndicator color={secondary ? colors.primary : colors.surface} /> : <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>}</Pressable>;
}
const styles = StyleSheet.create({ button: { minHeight: 50, paddingHorizontal: spacing.lg, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, secondary: { backgroundColor: colors.primaryLight }, text: { color: colors.surface, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }, secondaryText: { color: colors.primaryDark }, pressed: { opacity: 0.82 }, disabled: { opacity: 0.5 } });
