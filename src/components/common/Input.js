import { StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../../theme/colors'; import spacing from '../../theme/spacing';

export default function Input({ label, error, style, ...props }) {

    return <View style={[styles.wrapper, style]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
            placeholderTextColor={colors.textMuted}
            style={[styles.input, error && styles.inputError, props.multiline && styles.multiline]} {...props}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>;
}

const styles = StyleSheet.create({
    wrapper: { gap: spacing.xs },
    label: { color: colors.text, fontWeight: '600' },
    input: { minHeight: 50, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, color: colors.text },
    multiline: { minHeight: 110, paddingTop: spacing.md, textAlignVertical: 'top' },
    inputError: { borderColor: colors.error }, error: { color: colors.error, fontSize: 12 }
});
