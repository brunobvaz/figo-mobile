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
    style
}) {
    return <View style={[styles.header, style]}>
        <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
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
        color: colors.text,
        fontSize: typography.sizes.title,
        fontWeight: typography.weights.bold
    },
    subtitle: {
        marginTop: spacing.xs,
        color: colors.textMuted,
        fontSize: typography.sizes.caption
    },
    location: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.sm
    },
    locationText: {
        maxWidth: '85%',
        color: colors.text,
        fontSize: typography.sizes.caption,
        fontWeight: typography.weights.medium
    },
    right: {
        alignSelf: 'flex-start'
    },
    pressed: {
        opacity: 0.7
    }
});
