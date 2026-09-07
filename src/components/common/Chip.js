import { Pressable, StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function Chip({
    label,
    selected = false,
    variant = 'filled',
    disabled = false,
    onPress,
    style,
    textStyle,
    accessibilityLabel
}) {
    const outlined = variant === 'outlined';

    return <Pressable
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
            styles.chip,
            outlined && styles.outlined,
            selected && (outlined ? styles.outlinedSelected : styles.selected),
            pressed && styles.pressed,
            disabled && styles.disabled,
            style
        ]}
    >
        <Text style={[
            styles.text,
            outlined && styles.outlinedText,
            selected && !outlined && styles.selectedText,
            textStyle
        ]}>
            {label}
        </Text>
    </Pressable>;
}

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: colors.cream
    },
    selected: {
        backgroundColor: colors.primaryFigo
    },
    outlined: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: colors.primaryFigo,
        borderRadius: 18,
        backgroundColor: colors.transparent
    },
    outlinedSelected: {
        backgroundColor: colors.primaryLightFigo
    },
    text: {
        color: colors.text,
        fontSize: typography.sizes.body
    },
    selectedText: {
        color: colors.surface,
        fontWeight: typography.weights.bold
    },
    outlinedText: {
        color: colors.primaryDarkFigo,
        fontWeight: typography.weights.semibold
    },
    pressed: {
        opacity: 0.7
    },
    disabled: {
        opacity: 0.5
    }
});
