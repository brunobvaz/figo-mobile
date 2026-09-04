import { Pressable, StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function IconButton({
    icon,
    label,
    onPress,
    selected = false,
    disabled = false,
    style,
    textStyle,
    accessibilityLabel
}) {
    return <Pressable
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
            styles.button,
            selected && styles.selected,
            pressed && styles.pressed,
            disabled && styles.disabled,
            style
        ]}
    >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.label, selected && styles.selectedLabel, textStyle]}>
            {label}
        </Text>
    </Pressable>;
}

const styles = StyleSheet.create({
    button: {
        width: 82,
        padding: spacing.sm,
        borderRadius: 16,
        alignItems: 'center',
        backgroundColor: colors.cream
    },
    selected: {
        backgroundColor: colors.primaryLight
    },
    icon: {
        fontSize: typography.sizes.title
    },
    label: {
        marginTop: spacing.xs,
        color: colors.text,
        fontSize: typography.sizes.caption,
        fontWeight: typography.weights.medium
    },
    selectedLabel: {
        color: colors.primaryDark,
        fontWeight: typography.weights.bold
    },
    pressed: {
        opacity: 0.7
    },
    disabled: {
        opacity: 0.5
    }
});
