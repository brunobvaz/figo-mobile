import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style }) {

  const secondary = variant === 'secondary';
  const soft = variant === 'soft';
  const foreground = secondary || soft ? colors.primaryDarkFigo : colors.surface;

  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={typeof title === 'string' ? title.replace(/\n/g, ' ') : undefined}
    accessibilityState={{ disabled: disabled || loading, busy: loading }}
    disabled={disabled || loading}
    onPress={onPress}
    style={({ pressed }) => [styles.button, secondary && styles.secondary, soft && styles.soft, icon && styles.withIcon, pressed && styles.pressed, (disabled || loading) && styles.disabled, style]}
  >
    {
      loading ? <ActivityIndicator color={foreground} />
        :
        <>
          {icon ? <Ionicons name={icon} size={28} color={foreground} /> : null}
          <Text style={[styles.text, { color: foreground }]}>
            {title}
          </Text>
        </>}
  </Pressable>;
}
const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    backgroundColor: colors.primaryDarkFigo,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primaryDarkFigo
  },
  soft: {
    minHeight: 70,
    paddingVertical: 12,
    backgroundColor: '#F6F1F9',
    borderWidth: 1,
    borderColor: '#EEE5F4'
  },
  withIcon: {
    flexDirection: 'row',
    gap: 14
  },
  text: {
    flexShrink: 1,
    color: colors.surface,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold
  },
  pressed: {
    opacity: 0.82
  },
  disabled: {
    opacity: 0.5
  }
});
