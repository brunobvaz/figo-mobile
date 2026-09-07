import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Screen from '../../components/layout/Screen';
import useRegistration from '../../hooks/useRegistration';
import { ROUTES } from '../../navigation/routes';
import sharedStyles from '../../theme/SharedStyles';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { isStrongPassword, isValidEmail } from '../../utils/validators';

export default function RegisterScreen({ navigation }) {
    const { registration, updateRegistration } = useRegistration();
    const [form, setForm] = useState(registration);
    const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

    const next = () => {
        if (!form.firstName.trim() || !form.lastName.trim()) return Alert.alert('Nome incompleto', 'Indica o teu nome e apelido.');
        if (!isValidEmail(form.email)) return Alert.alert('Email inválido', 'Indica um endereço de email válido.');
        if (!/^(?:(?:\+|00)351)?[29]\d{8}$/.test(form.phone.replace(/\s/g, ''))) return Alert.alert('Telefone inválido', 'Indica um número de telefone português válido.');
        if (!isStrongPassword(form.password)) return Alert.alert('Palavra-passe inválida', 'Usa pelo menos 10 caracteres, com maiúscula, minúscula, número e símbolo.');
        if (form.password !== form.passwordConfirmation) return Alert.alert('Palavras-passe diferentes', 'A confirmação deve ser igual à palavra-passe.');
        updateRegistration(form);
        navigation.navigate(ROUTES.REGISTER_DETAILS);
    };

    return <Screen scroll contentContainerStyle={sharedStyles.authContainer}>
        <View style={styles.progress}>
            <Text style={styles.step}>Passo 1 de 2</Text>
            <View style={styles.track}><View style={styles.halfTrack} /></View>
        </View>
        <Text style={sharedStyles.screenTitle}>Os teus dados</Text>
        <Text style={sharedStyles.screenSubtitle}>Começa por criar os dados de acesso à tua conta.</Text>
        <View style={sharedStyles.form}>
            <Input label="Nome" value={form.firstName} onChangeText={update('firstName')} autoComplete="given-name" />
            <Input label="Apelido" value={form.lastName} onChangeText={update('lastName')} autoComplete="family-name" />
            <Input label="Email" value={form.email} onChangeText={update('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <Input label="Telefone" value={form.phone} onChangeText={update('phone')} keyboardType="phone-pad" autoComplete="tel" />
            <Input label="Palavra-passe" value={form.password} onChangeText={update('password')} secureTextEntry autoComplete="new-password" />
            <Input label="Confirmar palavra-passe" value={form.passwordConfirmation} onChangeText={update('passwordConfirmation')} secureTextEntry autoComplete="new-password" onSubmitEditing={next} />
            <Text style={styles.hint}>Pelo menos 10 caracteres, com maiúscula, minúscula, número e símbolo.</Text>
            <Button title="Continuar" onPress={next} />
            <Button title="Já tenho conta" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
    </Screen>;
}

const styles = StyleSheet.create({
    progress: { gap: spacing.sm },
    step: { color: colors.primaryDarkFigo, fontWeight: '700' },
    track: { height: 5, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
    halfTrack: { width: '50%', height: '100%', backgroundColor: colors.primaryFigo },
    hint: { color: colors.textMuted, fontSize: 12, marginTop: -spacing.sm }
});
