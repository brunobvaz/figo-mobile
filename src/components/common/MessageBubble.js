import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function MessageBubble({
    message,
    own = false,
    timestamp,
    status,
    style
}) {
    const metadata = [timestamp, status].filter(Boolean).join(' · ');

    return <View style={[
        styles.bubble,
        own ? styles.ownBubble : styles.otherBubble,
        style
    ]}>
        <Text style={[styles.message, own && styles.ownMessage]}>
            {message}
        </Text>

        {metadata ?
            <Text style={[styles.metadata, own && styles.ownMetadata]}>
                {metadata}
            </Text>
            : null
        }
    </View>;
}

const styles = StyleSheet.create({
    bubble: {
        maxWidth: '82%',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 16,
        gap: spacing.xs
    },
    ownBubble: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primaryFigo
    },
    otherBubble: {
        alignSelf: 'flex-start',
        backgroundColor: colors.cream
    },
    message: {
        color: colors.text,
        fontSize: typography.sizes.body,
        lineHeight: typography.lineHeights.body
    },
    ownMessage: {
        color: colors.surface
    },
    metadata: {
        color: colors.textMuted,
        fontSize: typography.sizes.caption,
        textAlign: 'right'
    },
    ownMetadata: {
        color: colors.primaryLightFigo
    }
});
