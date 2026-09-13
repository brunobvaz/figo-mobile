import { useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LinkButton from '../../components/common/LinkButton';
import Screen from '../../components/layout/Screen';
import useAuth from '../../hooks/useAuth';
import useRegistration from '../../hooks/useRegistration';
import { authService } from '../../services/authService';
import sharedStyles from '../../theme/SharedStyles';

const OTP_LENGTH = 6;

export default function OtpVerificationScreen({ navigation, route }) {
    const { verifyRegistrationOtp, isLoading } = useAuth();
    const { clearRegistration } = useRegistration();
    const { challengeId, email, devCode } = route.params || {};
    const [code, setCode] = useState('');
    const [isResending, setIsResending] = useState(false);

    const resendLock = useRef(false);
    const [resendAt, setResendAt] = useState(() => Date.now() + (route.params?.resendAfterSeconds ?? 60) * 1000);
    const [secondsLeft, setSecondsLeft] = useState(0);
    useEffect(() => {
        const tick = () => setSecondsLeft(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
        tick(); const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [resendAt]);
    const developmentCode = __DEV__ && devCode;
    const updateCode = (value) => setCode(value.replace(/\D/g, '').slice(0, OTP_LENGTH));

    const submit = async () => {
        if (!challengeId) {
            return Alert.alert('Verificação indisponível', 'Não foi recebido um pedido de verificação válido. Volta ao registo e tenta novamente.');
        }
        if (code.length !== OTP_LENGTH) {
            return Alert.alert('Código incompleto', `Introduz os ${OTP_LENGTH} dígitos do código de verificação.`);
        }

        try {
            await verifyRegistrationOtp({ challengeId, code });
            clearRegistration();
        }
        catch (error) {
            Alert.alert('Código inválido', error.message);
        }
    };

    const resend = async () => {
        if (!challengeId) {
            return Alert.alert('Verificação indisponível', 'Volta ao registo para pedir um novo código.');
        }
        if (resendLock.current || Date.now() < resendAt) return;
        resendLock.current = true;
        setIsResending(true);
        try {
            const verification = await authService.resendRegistrationOtp({ challengeId });
            navigation.setParams({ challengeId: verification.challengeId, email: verification.email, devCode: __DEV__ ? verification.devCode : undefined });
            setCode('');
            setResendAt(Date.now() + (verification.resendAfterSeconds ?? 60) * 1000);
            Alert.alert(__DEV__ && verification.devCode ? 'Código de teste gerado' : 'Código reenviado', __DEV__ && verification.devCode ? 'O novo código está visível neste ecrã. Não foi enviado email.' : `Enviámos um novo código de verificação para ${email}.`);
        }
        catch (error) {
            Alert.alert('Não foi possível reenviar', error.message);
        }
        finally {
            resendLock.current = false;
            setIsResending(false);
        }
    };

    return <Screen scroll contentContainerStyle={sharedStyles.authContainer}>
        <Text style={sharedStyles.screenTitle}>Verifica o teu email</Text>
        <Text style={sharedStyles.screenSubtitle}>
            {challengeId
                ? (developmentCode ? 'Usa o código de desenvolvimento apresentado abaixo. Não foi enviado email.' : `Introduz o código de ${OTP_LENGTH} dígitos que enviámos para ${email}.`)
                : 'Não foi recebido um pedido de verificação válido. Volta ao registo e tenta novamente.'}
        </Text>

        <View style={sharedStyles.form}>
            <Input
                label="Código de verificação"
                value={code}
                onChangeText={updateCode}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                returnKeyType="done"
                onSubmitEditing={submit}
            />
            <Button
                title="Verificar código"
                loading={isLoading}
                disabled={isResending || !challengeId}
                onPress={submit}
            />
        </View>

        <LinkButton
            title={isResending ? 'A reenviar código…' : secondsLeft > 0 ? `Reenviar em ${secondsLeft}s` : 'Reenviar código'}
            disabled={isLoading || isResending || secondsLeft > 0 || !challengeId}
            onPress={resend}
        />
        <LinkButton
            title="Alterar dados do registo"
            disabled={isLoading || isResending}
            onPress={() => navigation.goBack()}
        />

        {__DEV__ && devCode ? <Text style={sharedStyles.helperNote}>Código de desenvolvimento: {devCode}</Text> : null}
    </Screen>;
}
