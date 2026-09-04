import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import Chip from '../../components/common/Chip';
import Input from '../../components/common/Input';
import Screen from '../../components/layout/Screen';
import useRegistration from '../../hooks/useRegistration';
import { ROUTES } from '../../navigation/routes';
import { authService } from '../../services/authService';
import sharedStyles from '../../theme/SharedStyles';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function RegisterDetailsScreen({ navigation }) {
    const { registration } = useRegistration();
    const [form, setForm] = useState({ city: 'Ponte de Lima', postalCode: '', roles: ['buyer'], confirmAdult: false, acceptTerms: false, marketingConsent: false });
    const [isLoading, setIsLoading] = useState(false);
    const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
    const toggle = (key) => setForm((current) => ({ ...current, [key]: !current[key] }));

    const submit = async () => {
        if (!registration.email) return Alert.alert('Dados em falta', 'Volta ao primeiro passo e preenche os teus dados.');
        if (!form.city.trim() || !/^\d{4}-\d{3}$/.test(form.postalCode)) return Alert.alert('Localização inválida', 'Indica a cidade e o código postal no formato 0000-000.');
        if (!form.roles.length) return Alert.alert('Seleciona um perfil', 'Escolhe comprador, vendedor ou ambos.');
        if (!form.confirmAdult) return Alert.alert('Confirmação necessária', 'Tens de confirmar que tens pelo menos 18 anos.');
        if (!form.acceptTerms) return Alert.alert('Termos obrigatórios', 'Tens de aceitar os Termos e a Política de Privacidade.');
        setIsLoading(true);
        try {
            const { passwordConfirmation: _ignored, ...account } = registration;
            const result = await authService.register({ ...account, roles: form.roles, location: { city: form.city, postalCode: form.postalCode }, confirmAdult: form.confirmAdult, acceptTerms: form.acceptTerms, marketingConsent: form.marketingConsent });
            if (!result?.verification?.challengeId) throw new Error('O servidor não devolveu o pedido de verificação. Reinicia o backend e tenta novamente.');
            navigation.navigate(ROUTES.OTP_VERIFICATION, result.verification);
        } catch (error) {
            Alert.alert('Não foi possível criar a conta', error.message);
        } finally { setIsLoading(false); }
    };

    return <Screen scroll contentContainerStyle={sharedStyles.authContainer}>
        <View style={styles.progress}>
            <Text style={styles.step}>Passo 2 de 2</Text>
            <View style={styles.track}><View style={styles.fullTrack} /></View>
        </View>
        <Text style={sharedStyles.screenTitle}>Como queres usar a DaTerra?</Text>
        <Text style={sharedStyles.screenSubtitle}>Podes comprar, vender ou fazer ambos.</Text>
        <Text style={styles.label}>Perfil</Text>
        <View style={styles.roles}>
            {['buyer', 'seller'].map((role) => {
                const selected = form.roles.includes(role);
                return <Chip key={role} label={role === 'buyer' ? 'Comprador' : 'Vendedor'} selected={selected} onPress={() => setForm((current) => ({ ...current, roles: selected ? current.roles.filter((item) => item !== role) : [...current.roles, role] }))} />;
            })}
        </View>
        <Input label="Cidade" value={form.city} onChangeText={update('city')} />
        <Input label="Código postal" value={form.postalCode} onChangeText={update('postalCode')} keyboardType="numbers-and-punctuation" placeholder="5370-000" />
        <CheckRow checked={form.confirmAdult} label="Confirmo que tenho pelo menos 18 anos." onPress={() => toggle('confirmAdult')} />
        <CheckRow checked={form.acceptTerms} label="Aceito os Termos e a Política de Privacidade." onPress={() => toggle('acceptTerms')} />
        <CheckRow checked={form.marketingConsent} label="Quero receber novidades e promoções (opcional)." onPress={() => toggle('marketingConsent')} />
        <Button title="Criar conta" loading={isLoading} onPress={submit} />
        <Button title="Voltar" variant="secondary" disabled={isLoading} onPress={() => navigation.goBack()} />
    </Screen>;
}

function CheckRow({ checked, label, onPress }) {
    return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={styles.checkRow}>
        <Text style={styles.checkbox}>{checked ? '☑' : '☐'}</Text><Text style={styles.checkLabel}>{label}</Text>
    </Pressable>;
}

const styles = StyleSheet.create({
    progress: { gap: spacing.sm }, step: { color: colors.primaryDark, fontWeight: '700' },
    track: { height: 5, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
    fullTrack: { width: '100%', height: '100%', backgroundColor: colors.primary },
    label: { color: colors.text, fontWeight: '600' }, roles: { flexDirection: 'row', gap: spacing.sm },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    checkbox: { color: colors.primaryDark, fontSize: 24 }, checkLabel: { color: colors.text, flex: 1 }
});
