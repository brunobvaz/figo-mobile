import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Badge from '../components/common/Badge';
import mockConversations from '../data/mockConversations';
import ChatScreen from '../screens/chat/ChatScreen';
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import ExploreScreen from '../screens/explore/ExploreScreen'; 
import FavoritesScreen from '../screens/favorites/FavoritesScreen'; 
import HomeScreen from '../screens/home/HomeScreen'; 
import OrdersScreen from '../screens/orders/OrdersScreen'; 
import CreateProductScreen from '../screens/product/CreateProductScreen'; 
import ProductDetailsScreen from '../screens/product/ProductDetailsScreen'; 
import EditProfileScreen from '../screens/profile/EditProfileScreen'; 
import ProfileScreen from '../screens/profile/ProfileScreen'; 
import SellerProfileScreen from '../screens/seller/SellerProfileScreen'; 
import colors from '../theme/colors'; import { ROUTES } from './routes';

const Stack = createNativeStackNavigator(); 
const Tabs = createBottomTabNavigator();
const tabIcons = { HomeTab: ['home', 'home-outline'], ExploreTab: ['compass', 'compass-outline'], SellTab: ['add-circle', 'add-circle-outline'], Conversations: ['chatbubbles', 'chatbubbles-outline'], ProfileTab: ['person', 'person-outline'] };
const unreadMessages = mockConversations.reduce((total, item) => total + item.unreadCount, 0);

function TabIcon({ routeName, focused, color, size }) {
    return <View style={styles.tabIcon}>
        <Ionicons
            name={tabIcons[routeName][focused ? 0 : 1]}
            color={color}
            size={routeName === ROUTES.SELL ? size + 6 : size}
        />
        {routeName === ROUTES.CONVERSATIONS ?
            <Badge
                value={unreadMessages}
                accessibilityLabel={`${unreadMessages} mensagens não lidas`}
                style={styles.tabBadge}
            />
            : null
        }
    </View>;
}

function TabNavigator() { 
    return <Tabs.Navigator 
            screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.primaryDark, tabBarInactiveTintColor: colors.textMuted, tabBarStyle: { height: 68, paddingTop: 7, paddingBottom: 8, backgroundColor: colors.surface, borderTopColor: colors.border }, tabBarIcon: ({ focused, color, size }) => <TabIcon routeName={route.name} focused={focused} color={color} size={size} /> })}>
                <Tabs.Screen name={ROUTES.HOME} component={HomeScreen} options={{ title: 'Início' }} />
                <Tabs.Screen name={ROUTES.EXPLORE} component={ExploreScreen} options={{ title: 'Explorar' }} />
                <Tabs.Screen name={ROUTES.SELL} component={CreateProductScreen} options={{ title: 'Vender' }} />
                <Tabs.Screen name={ROUTES.CONVERSATIONS} component={ConversationsScreen} options={{ title: 'Conversas' }} />
                <Tabs.Screen name={ROUTES.PROFILE} component={ProfileScreen} options={{ title: 'Perfil' }} />
            </Tabs.Navigator>; }

export default function MainNavigator() { 
    return <Stack.Navigator screenOptions={{ headerTintColor: colors.primaryDark, headerBackTitle: 'Voltar', headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false }}>
                <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name={ROUTES.PRODUCT_DETAILS} component={ProductDetailsScreen} options={{ title: 'Produto' }} />
                <Stack.Screen name={ROUTES.EDIT_PRODUCT} component={CreateProductScreen} options={{ title: 'Editar produto' }} />
                <Stack.Screen name={ROUTES.CHAT} component={ChatScreen} options={({ route }) => ({ title: route.params?.sellerName || 'Conversa' })} />
                <Stack.Screen name={ROUTES.FAVORITES} component={FavoritesScreen} options={{ title: 'Favoritos' }} />
                <Stack.Screen name={ROUTES.SELLER_PROFILE} component={SellerProfileScreen} options={{ title: 'Produtor' }} />
                <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} options={{ title: 'Editar perfil' }} />
                <Stack.Screen name={ROUTES.ORDERS} component={OrdersScreen} options={{ title: 'Encomendas' }} />
           </Stack.Navigator>; }

const styles = StyleSheet.create({
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
