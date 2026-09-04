import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LinkButton from '../../components/common/LinkButton';
import Screen from '../../components/layout/Screen';
import { authService } from '../../services/authService';
import sharedStyles from '../../theme/SharedStyles';
import { isStrongPassword } from '../../utils/validators';

export default function ResetPasswordScreen({ navigation, route }) {
    const token = route.params?.token;
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const submit = async () => {
        if (!isStrongPassword(password)) {
            return Alert.alert('Palavra-passe inválida', 'Usa pelo menos 10 caracteres, com maiúscula, minúscula, número e símbolo.');
        }
        if (password !== passwordConfirmation) {
            return Alert.alert('Palavras-passe diferentes', 'Confirma novamente a nova palavra-passe.');
        }
        if (!token) {
            return Alert.alert('Link inválido', 'Pede um novo link de recuperação de palavra-passe.');
        }

        setIsLoading(true);
        try {
            await authService.resetPassword({ token, newPassword: password });
            Alert.alert(
                'Palavra-passe alterada',
                'Já podes entrar na tua conta com a nova palavra-passe.',
                [{ text: 'Ir para o início de sessão', onPress: () => navigation.popToTop() }]
            );
        }
        catch (error) {
            Alert.alert('Não foi possível alterar', error.message);
        }
        finally {
            setIsLoading(false);
        }
    };

    return <Screen scroll contentContainerStyle={sharedStyles.authContainer}>
        <Text style={sharedStyles.screenTitle}>Define uma nova palavra-passe</Text>
        <Text style={sharedStyles.screenSubtitle}>
            Escolhe uma nova palavra-passe para voltares a entrar na tua conta.
        </Text>

        <View style={sharedStyles.form}>
            <Input
                label="Nova palavra-passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
            />
            <Input
                label="Confirmar nova palavra-passe"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={submit}
            />
            <Button
                title="Alterar palavra-passe"
                loading={isLoading}
                onPress={submit}
            />
        </View>

        <LinkButton
            title="Voltar ao início de sessão"
            disabled={isLoading}
            onPress={() => navigation.popToTop()}
        />
    </Screen>;
}
