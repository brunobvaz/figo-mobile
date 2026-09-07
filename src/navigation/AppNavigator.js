import { useCallback, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import SplashScreen from '../screens/wellcome/SplashScreen';
import useAuth from '../hooks/useAuth';
import colors from '../theme/colors';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { ChatProvider } from '../context/ChatContext';
import { ROUTES } from './routes';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, notification: colors.error } };
const linking = { prefixes: ['daterra://'], config: { screens: { [ROUTES.RESET_PASSWORD]: 'reset-password' } } };

export default function AppNavigator() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [splashReady, setSplashReady] = useState(false);
  const onSplashReady = useCallback(() => setSplashReady(true), []);

  // The splash is the first screen, replaced once startup is complete.
  if (isLoading || !splashReady) {
    return <SplashScreen onReady={onSplashReady} />;
  }

  return (
    <NavigationContainer
      theme={theme}
      linking={linking}
      fallback={<SplashScreen />}
    >
      {isAuthenticated ? <ChatProvider key={user.id}><MainNavigator /></ChatProvider> : <AuthNavigator />}
    </NavigationContainer>
  );
}
