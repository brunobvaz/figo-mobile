import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { ProductsProvider } from './src/context/ProductsContext';

// Keep the launch screen visible until the custom splash images are ready.
SplashScreen.preventAutoHideAsync().catch(console.warn);

export default function App() {
  return <SafeAreaProvider><AuthProvider><ProductsProvider><FavoritesProvider><StatusBar style="dark" /><AppNavigator /></FavoritesProvider></ProductsProvider></AuthProvider></SafeAreaProvider>;
}
