import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Screen from '../../components/layout/Screen';
import LinkButton from '../../components/common/LinkButton';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../navigation/routes';
import sharedStyles from '../../theme/SharedStyles';
import spacing from '../../theme/spacing';
import { isValidEmail } from '../../utils/validators';

export default function LoginScreen({ navigation }) {

    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
        <View style={styles.brand}>
            <Image
                source={require('../../../assets/splash-icon.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="FiGO"
            />
            <Text style={sharedStyles.brandTagline}>Produtos locais. Pessoas próximas.</Text>
        </View>
        <View style={sharedStyles.form}>
            <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none" />
            <Input
                label="Palavra-passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry />
            <Button
                title="Entrar"
                loading={isLoading}
                onPress={submit}
            />
            <Button
                title="Criar uma conta"
                variant="secondary"
                onPress={() => navigation.navigate('Register')}
            />
        </View>
        <LinkButton
            title="Esqueceste-te da palavra-passe?"
            onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
        />
    </Screen>
        ;
}
const styles = StyleSheet.create({
    container: { justifyContent: 'center', gap: spacing.xl, paddingVertical: spacing.xxl },
    brand: { alignItems: 'center' },
    logo: { width: 200, height: 200 }
});
