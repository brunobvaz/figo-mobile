import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { ProductsProvider } from './src/context/ProductsContext';

export default function App() {
  return <SafeAreaProvider><AuthProvider><ProductsProvider><FavoritesProvider><StatusBar style="dark" /><AppNavigator /></FavoritesProvider></ProductsProvider></AuthProvider></SafeAreaProvider>;
}
