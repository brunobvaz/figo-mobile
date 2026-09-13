import LoadingScreen from '../components/common/LoadingScreen';
import { useCallback, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import SplashScreen from '../screens/wellcome/SplashScreen';
import useAuth from '../hooks/useAuth';
import colors from '../theme/colors';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { ActiveLocationProvider } from '../context/ActiveLocationContext';
import { ChatProvider } from '../context/ChatContext';
import PushNotifications from '../components/PushNotifications';
import { navigationRef } from './navigationRef';
import { ROUTES } from './routes';

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, notification: colors.error } };
const linking = { prefixes: ['daterra://'], config: { screens: { [ROUTES.RESET_PASSWORD]: 'reset-password' } } };

export default function AppNavigator() {
  const { user, isAuthenticated, isRestoring } = useAuth();
  const [splashReady, setSplashReady] = useState(false);
  const onSplashReady = useCallback(() => setSplashReady(true), []);

  // The splash is the first screen, replaced once startup is complete.
  if (!splashReady) {
    return <SplashScreen onReady={onSplashReady} />;
  }

  if (isRestoring) return <LoadingScreen message="A preparar a Figo…" />;

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={theme}
      linking={linking}
      fallback={<LoadingScreen />}
    >
      {isAuthenticated ? <ActiveLocationProvider key={user.id}><ChatProvider><PushNotifications /><MainNavigator /></ChatProvider></ActiveLocationProvider> : <AuthNavigator />}
    </NavigationContainer>
  );
}
