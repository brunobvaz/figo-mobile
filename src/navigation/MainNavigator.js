import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { I18nManager, Keyboard, Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Badge from '../components/common/Badge';
import { useChat } from '../context/ChatContext';
import ChatScreen from '../screens/chat/ChatScreen';
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import ExploreScreen from '../screens/explore/ExploreScreen'; 
import AccountProductsScreen from '../screens/profile/AccountProductsScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen'; 
import HomeScreen from '../screens/home/HomeScreen';
import SeasonalRecipesScreen from '../screens/recipes/SeasonalRecipesScreen';
import FairsEventsScreen from '../screens/events/FairsEventsScreen'; 
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
    const { unreadTotal } = useChat();
    return <View style={styles.tabIcon}>
        <Ionicons
            name={tabIcons[routeName][focused ? 0 : 1]}
            color={color}
            size={routeName === ROUTES.SELL ? size + 6 : size}
        />
        {routeName === ROUTES.CONVERSATIONS ?
            <Badge
                value={unreadTotal}
                accessibilityLabel={`${unreadTotal} mensagens não lidas`}
                style={styles.tabBadge}
            />
            : null
        }
    </View>;
}

const TAB_BAR_HEIGHT = 72;
const TAB_BAR_GAP = 8;

function TabNavigator() {
    const insets = useSafeAreaInsets();
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
                tabBarHideOnKeyboard: true,
                tabBarStyle: [styles.floatingBar, { bottom: keyboardVisible ? 0 : bottom, start: (I18nManager.isRTL ? insets.right : insets.left) + 16, end: (I18nManager.isRTL ? insets.left : insets.right) + 16 }],
                // Absolute bars reserve no space by themselves. Keep every tab's viewport clear centrally.
                sceneStyle: { paddingBottom: keyboardVisible ? 0 : TAB_BAR_HEIGHT + bottom + TAB_BAR_GAP, backgroundColor: colors.background },
                tabBarIcon: ({ focused, color, size }) => <TabIcon routeName={route.name} focused={focused} color={color} size={size} />
            })}>
                <Tabs.Screen name={ROUTES.HOME} component={HomeScreen} options={{ title: 'Início' }} />
                <Tabs.Screen name={ROUTES.EXPLORE} component={ExploreScreen} options={{ title: 'Explorar' }} />
                <Tabs.Screen name={ROUTES.SELL} component={CreateProductScreen} options={{ title: 'Vender' }} />
                <Tabs.Screen name={ROUTES.CONVERSATIONS} component={ConversationsScreen} options={{ title: 'Conversas' }} />
                <Tabs.Screen name={ROUTES.PROFILE} component={ProfileScreen} options={{ title: 'Perfil' }} />
            </Tabs.Navigator>; }

export default function MainNavigator() { 
    return <Stack.Navigator screenOptions={{ headerTintColor: colors.primaryDarkFigo, headerBackTitle: 'Voltar', headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false }}>
                <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name={ROUTES.SEASONAL_RECIPES} component={SeasonalRecipesScreen} options={{ title: 'Receitas da época' }} />
                <Stack.Screen name={ROUTES.FAIRS_EVENTS} component={FairsEventsScreen} options={{ title: 'Feiras e eventos' }} />
                <Stack.Screen name={ROUTES.PRODUCT_DETAILS} component={ProductDetailsScreen} options={{ title: 'Produto' }} />
                <Stack.Screen name={ROUTES.EDIT_PRODUCT} component={CreateProductScreen} options={{ title: 'Editar produto' }} />
                <Stack.Screen getId={({ params }) => params?.conversationId || params?.productId} name={ROUTES.CHAT} component={ChatScreen} options={({ route }) => ({ title: route.params?.participantName || route.params?.sellerName || 'Conversa' })} />
                <Stack.Screen name={ROUTES.MY_PRODUCTS} component={AccountProductsScreen} options={{ title: 'Os meus anúncios' }} />
                <Stack.Screen name={ROUTES.FAVORITES} component={FavoritesScreen} options={{ title: 'Favoritos' }} />
                <Stack.Screen name={ROUTES.SELLER_PROFILE} component={SellerProfileScreen} options={{ title: 'Produtor' }} />
                <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} options={{ title: 'Editar perfil' }} />
                <Stack.Screen name={ROUTES.ORDERS} component={OrdersScreen} options={{ title: 'Encomendas' }} />
           </Stack.Navigator>; }

const styles = StyleSheet.create({
    floatingBar: {
        position: 'absolute',
        height: TAB_BAR_HEIGHT,
        borderRadius: 28,
        paddingTop: 7,
        paddingBottom: 8,
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
        position: 'absolute',
        top: -8,
        right: -12,
        transform: [{ scale: 0.8 }]
    }
});
