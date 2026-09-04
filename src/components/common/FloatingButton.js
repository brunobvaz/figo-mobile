import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import Badge from './Badge';
import colors from '../../theme/colors';
import shadows from '../../theme/shadows';
import spacing from '../../theme/spacing';

export default function FloatingButton({
    onPress,
    icon = 'chatbubble-ellipses',
    iconSize = 26,
    badge,
    disabled = false,
    style,
    accessibilityLabel = 'Abrir conversa'
}) {
    return <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={spacing.sm}
        onPress={onPress}
        style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            disabled && styles.disabled,
            style
        ]}
    >
        <Ionicons name={icon} size={iconSize} color={colors.surface} />

        <Badge
            value={badge}
            accessibilityLabel={`${badge} mensagens não lidas`}
            style={styles.badge}
        />
    </Pressable>;
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        right: spacing.md,
        bottom: spacing.md,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        ...shadows.card
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2
    },
    pressed: {
        opacity: 0.82,
        transform: [{ scale: 0.96 }]
    },
    disabled: {
        opacity: 0.5
    }
});
