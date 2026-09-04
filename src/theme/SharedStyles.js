import { StyleSheet } from 'react-native';
import colors from './colors';
import spacing from './spacing';
import typography from './typography';

export default StyleSheet.create({
    authContainer: {
        paddingTop: spacing.xl,
        gap: spacing.md
    },
    form: {
        gap: spacing.md
    },
    screenTitle: {
        color: colors.primaryDark,
        fontSize: typography.sizes.screenTitle,
        fontWeight: typography.weights.extraBold
    },
    screenSubtitle: {
        color: colors.textMuted,
        lineHeight: typography.lineHeights.body,
        marginBottom: spacing.md
    },
    sectionTitle: {
        color: colors.text,
        fontSize: typography.sizes.sectionTitle,
        fontWeight: typography.weights.bold
    },
    brandIcon: {
        fontSize: typography.sizes.icon
    },
    brandLogo: {
        color: colors.primaryDark,
        fontSize: typography.sizes.logo,
        fontWeight: typography.weights.extraBold
    },
    brandTagline: {
        marginTop: spacing.sm,
        color: colors.textMuted
    },
    helperNote: {
        color: colors.textMuted,
        fontSize: typography.sizes.caption,
        textAlign: 'center'
    }
});
