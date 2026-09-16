import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function Header({
    title,
    subtitle,
    location,
    onLocationPress,
    right,
    titleStyle,
    style
}) {
    return <View style={[styles.header, style]}>
        <View style={styles.copy}>
            <Text accessibilityRole="header" style={[styles.title, titleStyle]}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

            {location ?
                <Pressable
                    accessibilityRole={onLocationPress ? 'button' : undefined}
                    accessibilityLabel={onLocationPress ? `Alterar localização: ${location}` : undefined}
                    disabled={!onLocationPress}
                    onPress={onLocationPress}
                    style={({ pressed }) => [styles.location, pressed && styles.pressed]}
                >
                    <Ionicons name="location" size={14} color={colors.error} />
                    <Text numberOfLines={1} style={styles.locationText}>{location}</Text>
                    {onLocationPress ?
                        <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
                        : null
                    }
                </Pressable>
                : null
            }
        </View>

        {right ? <View style={styles.right}>{right}</View> : null}
    </View>;
}

const styles = StyleSheet.create({
    header: {
        minHeight: 68,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md
    },
    copy: {
        flex: 1
    },
    title: {
        color: colors.primaryDarkFigo,
        fontSize: typography.sizes.screenTitle,
        fontWeight: typography.weights.bold
    },
    subtitle: {
        marginTop: spacing.xs,
        color: colors.textMuted,
        fontSize: 14
    },
    location: {
        alignSelf: 'flex-start',
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.sm
    },
    locationText: {
        flexShrink: 1,
        color: colors.text,
        fontSize: 14,
        fontWeight: typography.weights.medium
    },
    right: {
        alignSelf: 'flex-start'
    },
    pressed: {
        opacity: 0.7
    }
});
