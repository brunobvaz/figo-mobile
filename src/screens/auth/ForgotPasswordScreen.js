import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LinkButton from '../../components/common/LinkButton';
import Screen from '../../components/layout/Screen';
import { authService } from '../../services/authService';
import sharedStyles from '../../theme/SharedStyles';
import { isValidEmail } from '../../utils/validators';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const submit = async () => {
        if (!isValidEmail(email)) {
            return Alert.alert('Email inválido', 'Indica o email associado à tua conta.');
        }

        setIsLoading(true);
        try {
            await authService.requestPasswordReset({ email });
            Alert.alert(
                'Verifica o teu email',
                'Se existir uma conta associada a este endereço, receberás as instruções para redefinir a palavra-passe.'
            );
        }
        catch (error) {
            Alert.alert('Não foi possível enviar', error.message);
        }
        finally {
            setIsLoading(false);
        }
    };

    return <Screen scroll contentContainerStyle={sharedStyles.authContainer}>
        <Text style={sharedStyles.screenTitle}>Recuperar palavra-passe</Text>
        <Text style={sharedStyles.screenSubtitle}>
            Indica o teu email e enviaremos as instruções para voltares a entrar na tua conta.
        </Text>

        <View style={sharedStyles.form}>
            <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="send"
                onSubmitEditing={submit}
            />
            <Button
                title="Enviar instruções"
                loading={isLoading}
                onPress={submit}
            />
        </View>

        <LinkButton
            title="Voltar ao início de sessão"
            disabled={isLoading}
            onPress={() => navigation.goBack()}
        />
    </Screen>;
}
