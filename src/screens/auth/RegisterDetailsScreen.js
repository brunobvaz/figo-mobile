import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import Chip from '../../components/common/Chip';
import AddressSelect from '../../components/common/AddressSelect';
import Screen from '../../components/layout/Screen';
import useRegistration from '../../hooks/useRegistration';
import { ROUTES } from '../../navigation/routes';
import { authService } from '../../services/authService';
import sharedStyles from '../../theme/SharedStyles';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function RegisterDetailsScreen({ navigation }) {
    const { registration } = useRegistration();
    const [form, setForm] = useState({ location: { municipalityCode: '', parishCode: '' }, usageIntent: undefined, confirmAdult: false, acceptTerms: false, marketingConsent: false });
    const [isLoading, setIsLoading] = useState(false);
    const toggle = (key) => setForm((current) => ({ ...current, [key]: !current[key] }));

    const submit = async () => {
        if (!registration.email) return Alert.alert('Dados em falta', 'Volta ao primeiro passo e preenche os teus dados.');
        if (!form.location.municipalityCode || !form.location.parishCode) return Alert.alert('Localização em falta', 'Seleciona o concelho e a freguesia.');
        if (!form.confirmAdult) return Alert.alert('Confirmação necessária', 'Tens de confirmar que tens pelo menos 18 anos.');
        if (!form.acceptTerms) return Alert.alert('Termos obrigatórios', 'Tens de aceitar os Termos e a Política de Privacidade.');
        setIsLoading(true);
        try {
            const { firstName, lastName, email, password } = registration;
            const result = await authService.register({ firstName, lastName, email, password, usageIntent: form.usageIntent, location: form.location, confirmAdult: form.confirmAdult, acceptTerms: form.acceptTerms, marketingConsent: form.marketingConsent });
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
        <Text style={sharedStyles.screenTitle}>Completa o teu perfil</Text>
        <Text style={sharedStyles.screenSubtitle}>Conta-nos um pouco sobre como queres usar a Figo.</Text>
        <Text style={styles.label}>Como pensas usar a Figo? (opcional)</Text>
        <Text style={styles.hint}>Esta informação ajuda-nos a melhorar a experiência.</Text>
        <View style={styles.intents}>
            {[['buy', 'Quero comprar'], ['sell', 'Quero vender'], ['both', 'Ambos']].map(([value, label]) =>
                <Chip key={value} label={label} selected={form.usageIntent === value} disabled={isLoading}
                    onPress={() => setForm(current => ({ ...current, usageIntent: current.usageIntent === value ? undefined : value }))} />
            )}
        </View>
        <Text style={styles.hint}>Podes deixar sem seleção ou tocar novamente para desmarcar.</Text>
        <Text style={styles.label}>Localização</Text>
        <AddressSelect {...form.location} onChange={location => setForm(current => ({ ...current, location }))} />
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
    progress: { gap: spacing.sm }, step: { color: colors.primaryDarkFigo, fontWeight: '700' },
    track: { height: 5, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
    fullTrack: { width: '100%', height: '100%', backgroundColor: colors.primaryFigo },
    label: { color: colors.text, fontWeight: '600' }, intents: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    hint: { color: colors.textMuted },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    checkbox: { color: colors.primaryDarkFigo, fontSize: 24 }, checkLabel: { color: colors.text, flex: 1 }
});
