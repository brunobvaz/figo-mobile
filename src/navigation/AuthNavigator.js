import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RegisterDetailsScreen from '../screens/auth/RegisterDetailsScreen';
import { RegistrationProvider } from '../context/RegistrationContext';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return <RegistrationProvider><Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
        <Stack.Screen name={ROUTES.REGISTER_DETAILS} component={RegisterDetailsScreen} />
        <Stack.Screen name={ROUTES.OTP_VERIFICATION} component={OtpVerificationScreen} />
        <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
        <Stack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPasswordScreen} />
    </Stack.Navigator></RegistrationProvider>;
}
