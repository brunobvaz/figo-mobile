import { Pressable, StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function LinkButton({
    title,
    onPress,
    disabled = false,
    style,
    textStyle,
    accessibilityLabel
}) {
    return <Pressable
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="link"
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={spacing.sm}
        onPress={onPress}
        style={({ pressed }) => [
            styles.link,
            pressed && styles.pressed,
            disabled && styles.disabled,
            style
        ]}
    >
        <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>;
}

const styles = StyleSheet.create({
    link: {
        alignSelf: 'center',
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.sm
    },
    text: {
        color: colors.primaryDark,
        fontSize: typography.sizes.body,
        fontWeight: typography.weights.semibold,
        textDecorationLine: 'underline'
    },
    pressed: {
        opacity: 0.7
    },
    disabled: {
        opacity: 0.5
    }
});
