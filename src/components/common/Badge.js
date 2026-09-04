import { StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function Badge({
    value,
    max = 99,
    style,
    accessibilityLabel
}) {
    if (value === undefined || value === null || value === 0) return null;

    const label = typeof value === 'number' && value > max ? `${max}+` : String(value);

    return <Text
        accessibilityLabel={accessibilityLabel || label}
        numberOfLines={1}
        style={[styles.badge, style]}
    >
        {label}
    </Text>;
}

const styles = StyleSheet.create({
    badge: {
        minWidth: 20,
        height: 20,
        paddingHorizontal: spacing.xs,
        borderRadius: 10,
        backgroundColor: colors.error,
        color: colors.surface,
        fontSize: typography.sizes.caption,
        fontWeight: typography.weights.bold,
        lineHeight: 20,
        textAlign: 'center',
        overflow: 'hidden'
    }
});
