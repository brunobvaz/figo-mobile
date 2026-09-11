import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Screen from '../../components/layout/Screen';
import LinkButton from '../../components/common/LinkButton';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';
import { isValidEmail } from '../../utils/validators';

export default function LoginScreen({ navigation }) {

    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const submit = async () => {
        if (!isValidEmail(email) || !password)
            return Alert.alert('Dados em falta', 'Indica um email válido e uma palavra-passe.');
        try {
            await login({ email, password });
        }
        catch (error) {
            if (error.code === 'EMAIL_NOT_VERIFIED' && error.details?.challengeId) {
                navigation.navigate(ROUTES.OTP_VERIFICATION, error.details);
                return;
            }
            Alert.alert('Não foi possível entrar', error.message);
        }
    };

    return <Screen scroll contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>Entra e descobre o que há perto de ti.</Text>
        </View>
        <View style={styles.form}>
            <Input
                label="Email"
                accessibilityLabel="Email"
                placeholder="nome@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                autoCorrect={false}
                autoCapitalize="none" />
            <View style={styles.passwordSection}>
                <View style={styles.passwordField}>
                    <Text style={styles.label}>Palavra-passe</Text>
                    {/* Local trailing control keeps the shared Input API unchanged. */}
                    <View style={styles.passwordRow}>
                        <TextInput
                            accessibilityLabel="Palavra-passe"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!passwordVisible}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="current-password"
                            textContentType="password"
                            returnKeyType="go"
                            onSubmitEditing={() => { if (!isLoading) submit(); }}
                            style={styles.passwordInput} />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={passwordVisible ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                            onPress={() => setPasswordVisible(current => !current)}
                            style={styles.visibilityButton}>
                            <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.primaryDarkFigo} />
                        </Pressable>
                    </View>
                </View>
                <LinkButton
                    title="Esqueceste-te da palavra-passe?"
                    onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
                    style={styles.forgot}
                    textStyle={styles.linkText} />
            </View>
            <Button title="Entrar" loading={isLoading} onPress={submit} style={styles.submit} />
            <View style={styles.register}>
                <Text style={styles.registerPrompt}>Ainda não tens conta?</Text>
                <LinkButton title="Criar uma conta" onPress={() => navigation.navigate(ROUTES.REGISTER)} style={styles.registerLink} textStyle={styles.linkText} />
            </View>
        </View>
    </Screen>;
}
const styles = StyleSheet.create({
    container: { flexGrow: 1, paddingTop: spacing.xxl + spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
    header: { gap: spacing.sm },
    title: { fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold, color: colors.primaryDarkFigo },
    subtitle: { fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body, color: colors.textMuted },
    form: { gap: spacing.md },
    passwordSection: { gap: spacing.md },
    passwordField: { gap: spacing.xs },
    label: { color: colors.text, fontWeight: typography.weights.semibold },
    passwordRow: { flexDirection: 'row', alignItems: 'center', minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
    passwordInput: { flex: 1, minWidth: 0, minHeight: 48, paddingLeft: spacing.md, paddingRight: spacing.xs, color: colors.text },
    visibilityButton: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
    forgot: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: 0 },
    linkText: { textDecorationLine: 'none' },
    submit: { width: '100%', marginTop: spacing.sm },
    register: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: spacing.xs, marginTop: spacing.sm },
    registerPrompt: { color: colors.textMuted, fontSize: typography.sizes.body },
    registerLink: { minHeight: 44, justifyContent: 'center' },
});
