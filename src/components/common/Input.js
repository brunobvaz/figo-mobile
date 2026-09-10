import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors'; import spacing from '../../theme/spacing';

export default function Input({ label, error, style, leadingIcon, ...props }) {

    return <View style={[styles.wrapper, style]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View>
        <TextInput
            placeholderTextColor={colors.textMuted}
            style={[styles.input, leadingIcon && styles.withIcon, error && styles.inputError, props.multiline && styles.multiline]} {...props}
        />
        {leadingIcon ? <View pointerEvents="none" accessible={false} style={styles.icon}>
            <Ionicons name={leadingIcon} size={20} color={colors.textMuted} />
        </View> : null}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>;
}

const styles = StyleSheet.create({
    wrapper: { gap: spacing.xs },
    label: { color: colors.text, fontWeight: '600' },
    withIcon: { paddingLeft: 46 },
    icon: { position: 'absolute', left: spacing.md, top: 0, bottom: 0, justifyContent: 'center' },
    input: { minHeight: 50, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, color: colors.text },
    multiline: { minHeight: 110, paddingTop: spacing.md, textAlignVertical: 'top' },
    inputError: { borderColor: colors.error }, error: { color: colors.error, fontSize: 12 }
});
