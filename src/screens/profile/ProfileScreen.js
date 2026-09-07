import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../components/common/Avatar'; 
import Button from '../../components/common/Button'; 
import Screen from '../../components/layout/Screen'; 
import useAuth from '../../hooks/useAuth'; 
import useFavorites from '../../hooks/useFavorites';
import useProducts from '../../hooks/useProducts'; 
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors'; 
import spacing from '../../theme/spacing';
import { formatLocation } from '../../utils/formatters';

export default function ProfileScreen({ navigation }) { 
    const { user, logout } = useAuth(); 
    const { favoriteIds } = useFavorites();
    const { products } = useProducts(); 
    const mine = products.filter((item) => item.seller.id === user.id).length; 
    const signOut = () => Alert.alert('Terminar sessão?', 'Podes voltar a entrar quando quiseres.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: logout }]); 
    
    return <Screen scroll contentContainerStyle={styles.page}>
        <View style={styles.profile}><Avatar uri={user.avatar} name={user.name} size={88} />
        <Text style={styles.name}>{user.name}</Text><Text style={styles.email}>{user.email}</Text>
        <Text style={styles.location}>📍 {formatLocation(user.location)}</Text>
        </View>
        <View style={styles.stat}>
            <Text style={styles.statNumber}>{mine}</Text>
            <Text style={styles.statLabel}>Os meus anúncios</Text>
            </View>
            <MenuItem 
            icon="create-outline" 
            label="Editar perfil" 
            onPress={() => navigation.navigate('EditProfile')} 
            />
            <MenuItem 
            icon="leaf-outline" 
            label="Os meus anúncios" 
            detail={`${mine}`} onPress={() => navigation.navigate('ExploreTab')} 
            />
            <MenuItem
            icon="heart-outline"
            label="Os meus favoritos"
            detail={`${favoriteIds.length}`}
            onPress={() => navigation.navigate(ROUTES.FAVORITES)}
            />
            <MenuItem 
            icon="basket-outline" 
            label="As minhas encomendas" 
            onPress={() => navigation.navigate('Orders')} 
            />
            <Button 
            title="Terminar sessão" 
            variant="secondary" 
            onPress={signOut}
            />
            </Screen>
            ; 
        }

function MenuItem({ icon, label, detail, onPress }) { 
    return <Pressable onPress={onPress} style={styles.item}>
        <Ionicons 
        name={icon} 
        size={22} 
        color={colors.primaryFigo} 
        />
        <Text 
        style={styles.itemLabel}
        >
            {label}
            </Text>
            {detail ? <Text style={styles.detail}>{detail}</Text> 
            : 
            null}
            <Ionicons 
            name="chevron-forward" 
            size={19} 
            color={colors.textMuted} 
            />
            </Pressable>
            ; 
        }

const styles = StyleSheet.create({ 
    page: { gap: spacing.md, paddingTop: spacing.lg }, 
    profile: { alignItems: 'center', gap: 5 }, 
    name: { color: colors.text, fontSize: 24, fontWeight: '800' }, 
    email: { color: colors.textMuted }, 
    location: { color: colors.primaryDarkFigo }, 
    stat: { padding: spacing.md, borderRadius: 16, backgroundColor: colors.cream, alignItems: 'center' }, 
    statNumber: { color: colors.primaryDarkFigo, fontSize: 23, fontWeight: '800' }, 
    statLabel: { color: colors.textMuted }, 
    item: { minHeight: 56, paddingHorizontal: spacing.md, borderRadius: 14, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: spacing.md }, 
    itemLabel: { flex: 1, color: colors.text, fontWeight: '600' }, detail: { color: colors.textMuted } 
});
