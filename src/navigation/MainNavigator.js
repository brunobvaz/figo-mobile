import AccountActionScreen from '../screens/profile/AccountActionScreen';
import LegalInfoScreen from '../screens/legal/LegalInfoScreen';
import LegalDocumentScreen from '../screens/legal/LegalDocumentScreen';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { I18nManager, Keyboard, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useChat } from '../context/ChatContext';
import ChatScreen from '../screens/chat/ChatScreen';
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import ExploreScreen from '../screens/explore/ExploreScreen'; 
import AccountProductsScreen from '../screens/profile/AccountProductsScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen'; 
import HomeScreen from '../screens/home/HomeScreen';
import SeasonalRecipesScreen from '../screens/recipes/SeasonalRecipesScreen';
import RecipeDetailScreen from '../screens/recipes/RecipeDetailScreen';
import FairsEventsScreen from '../screens/events/FairsEventsScreen'; 
import EventDetailScreen from '../screens/events/EventDetailScreen';
import OrdersScreen from '../screens/orders/OrdersScreen'; 
import CreateProductScreen from '../screens/product/CreateProductScreen'; 
import ProductDetailsScreen from '../screens/product/ProductDetailsScreen'; 
import EditProfileScreen from '../screens/profile/EditProfileScreen'; 
import ProfileScreen from '../screens/profile/ProfileScreen'; 
import SellerProfileScreen from '../screens/seller/SellerProfileScreen'; 
import shadows from '../theme/shadows';
import colors from '../theme/colors'; import { ROUTES } from './routes';

const Stack = createNativeStackNavigator(); 
const Tabs = createBottomTabNavigator();
const tabIcons = { HomeTab: ['home', 'home-outline'], ExploreTab: ['compass', 'compass-outline'], SellTab: ['add-circle', 'add-circle-outline'], Conversations: ['chatbubbles', 'chatbubbles-outline'], ProfileTab: ['person', 'person-outline'] };

function TabIcon({ routeName, focused, color, size }) {
    return <View style={styles.tabIcon}>
        <Ionicons
            name={tabIcons[routeName][focused ? 0 : 1]}
            color={color}
            size={routeName === ROUTES.SELL ? size + 6 : size}
        />
    </View>;
}

const TAB_BAR_HEIGHT = 64;
const TAB_BAR_GAP = 8;

function TabNavigator() {
    const { unreadTotal } = useChat();
    const insets = useSafeAreaInsets();
    const { width, fontScale } = useWindowDimensions();
    const barWidth = Math.min(640, width - insets.left - insets.right - 32);
    const side = Math.max(16, (width - insets.left - insets.right - barWidth) / 2);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    useEffect(() => {
        // Authentication can unmount its input before the keyboard hide event reaches this navigator.
        setKeyboardVisible(false);
        Keyboard.dismiss();
        const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
        const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
        const didHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => { show.remove(); hide.remove(); didHide.remove(); };
    }, []);
    const bottom = Math.max(insets.bottom, 8) + TAB_BAR_GAP;
    return <Tabs.Navigator
            safeAreaInsets={{ bottom: 0, left: 0, right: 0 }}
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primaryDarkFigo,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelPosition: 'below-icon',
                tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
                tabBarItemStyle: { minHeight: 52 },
                tabBarHideOnKeyboard: true,
                tabBarStyle: [styles.floatingBar, { height: TAB_BAR_HEIGHT + Math.max(0, Math.min(fontScale, 2) - 1) * 24, bottom: keyboardVisible ? 0 : bottom, start: (I18nManager.isRTL ? insets.right : insets.left) + side, end: (I18nManager.isRTL ? insets.left : insets.right) + side }],
                sceneStyle: { backgroundColor: colors.background },
                tabBarIcon: ({ focused, color, size }) => <TabIcon routeName={route.name} focused={focused} color={color} size={size} />
            })}>
                <Tabs.Screen name={ROUTES.HOME} component={HomeScreen} options={{ title: 'Início' }} />
                <Tabs.Screen name={ROUTES.EXPLORE} component={ExploreScreen} options={{ title: 'Explorar' }} />
                <Tabs.Screen name={ROUTES.SELL} component={CreateProductScreen} options={{ title: 'Vender' }} />
                <Tabs.Screen name={ROUTES.CONVERSATIONS} component={ConversationsScreen} options={{
                    title: 'Conversas',
                    tabBarBadge: unreadTotal > 0 ? (unreadTotal > 99 ? '99+' : unreadTotal) : undefined,
                    tabBarBadgeStyle: styles.tabBadge,
                    tabBarAccessibilityLabel: unreadTotal > 0
                        ? `Conversas, ${unreadTotal} ${unreadTotal === 1 ? 'novidade por ler' : 'novidades por ler'}`
                        : 'Conversas'
                }} />
                <Tabs.Screen name={ROUTES.PROFILE} component={ProfileScreen} options={{ title: 'Perfil' }} />
            </Tabs.Navigator>; }

export default function MainNavigator() { 
    return <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerTintColor: colors.primaryDarkFigo, headerTitleAlign: 'center', headerTitleStyle: { color: colors.primaryDarkFigo, fontSize: 18, fontWeight: '600' }, headerBackTitle: 'Voltar', headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false }}>
                <Stack.Screen name={ROUTES.LEGAL_INFO} component={LegalInfoScreen} options={{ title: 'Informação legal' }} />
        <Stack.Screen name={ROUTES.ACCOUNT_ACTION} component={AccountActionScreen} options={{ headerShown: true, title: 'Conta', headerBackTitle: 'Voltar' }} />
        <Stack.Screen name={ROUTES.LEGAL_DOCUMENT} component={LegalDocumentScreen} options={({ route }) => ({ headerShown: true, title: route.params?.title || 'Informação legal', headerBackTitle: 'Voltar' })} />
        <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name={ROUTES.SEASONAL_RECIPES} component={SeasonalRecipesScreen} options={{ title: 'Receitas da época' }} />
                <Stack.Screen name={ROUTES.RECIPE_DETAIL} component={RecipeDetailScreen} options={{ title: 'Receita' }} />
                <Stack.Screen name={ROUTES.FAIRS_EVENTS} component={FairsEventsScreen} options={{ title: 'Feiras e eventos' }} />
                <Stack.Screen name={ROUTES.EVENT_DETAIL} component={EventDetailScreen} options={{ title: 'Evento' }} />
                <Stack.Screen name={ROUTES.PRODUCT_DETAILS} component={ProductDetailsScreen} options={{ title: 'Produto' }} />
                <Stack.Screen name={ROUTES.EDIT_PRODUCT} component={CreateProductScreen} options={{ title: 'Editar produto' }} />
                <Stack.Screen getId={({ params }) => params?.conversationId || params?.productId} name={ROUTES.CHAT} component={ChatScreen} options={({ route }) => ({ title: route.params?.participantName || route.params?.sellerName || 'Conversa' })} />
                <Stack.Screen name={ROUTES.MY_PRODUCTS} component={AccountProductsScreen} options={{ title: 'Os meus anúncios' }} />
                <Stack.Screen name={ROUTES.FAVORITES} component={FavoritesScreen} options={{ title: 'Favoritos' }} />
                <Stack.Screen name={ROUTES.SELLER_PROFILE} component={SellerProfileScreen} options={{ title: 'Perfil' }} />
                <Stack.Screen name={ROUTES.SELLER_PRODUCTS} component={ExploreScreen} options={{ title: 'Produtos publicados' }} />
                <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} options={{ title: 'Editar perfil' }} />
                <Stack.Screen name={ROUTES.ORDERS} component={OrdersScreen} options={({ route }) => ({ title: route.params?.role === 'seller' ? 'As minhas vendas' : 'As minhas encomendas' })} />
           </Stack.Navigator>; }

const styles = StyleSheet.create({
    floatingBar: {
        position: 'absolute',
        height: TAB_BAR_HEIGHT,
        borderRadius: 28,
        paddingTop: 5,
        paddingBottom: 5,
        paddingHorizontal: 2,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderTopWidth: 1,
        borderColor: colors.border,
        borderTopColor: colors.border,
        ...shadows.card,
        shadowRadius: 12,
    },
    tabIcon: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center'
    },
    tabBadge: {
        backgroundColor: colors.error,
        color: colors.surface,
        fontSize: 11,
        fontWeight: '700'
    }
});
