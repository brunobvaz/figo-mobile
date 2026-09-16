import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, AppState, Linking, Pressable, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileAvatar from '../../components/common/ProfileAvatar';
import Button from '../../components/common/Button';
import ReviewsSheet from '../../components/reviews/ReviewsSheet';
import ProfileReputationCard from '../../components/profile/ProfileReputationCard';
import Screen from '../../components/layout/Screen';
import useAuth from '../../hooks/useAuth';
import useFavorites from '../../hooks/useFavorites';
import { ROUTES } from '../../navigation/routes';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { getNotifications, registerPushNotifications } from '../../services/pushNotifications';
import { locationLabel, profileLocation } from '../../utils/activeLocation';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import sharedStyles from '../../theme/SharedStyles';

const profileColors = {
    text: colors.text,
    muted: colors.textMuted,
    iconBackground: colors.surfaceSoft,
};

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { favoriteIds } = useFavorites();
    const { width, fontScale } = useWindowDimensions();
    const heroWidth = Math.min(width, 560);
    const [mine, setMine] = useState(null);
    const [commerce, setCommerce] = useState(null);
    const [commerceError, setCommerceError] = useState(null);
    const [reviewsOpen, setReviewsOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [checkingNotifications, setCheckingNotifications] = useState(true);
    const [updatingNotifications, setUpdatingNotifications] = useState(false);
    const editProfile = () => navigation.navigate(ROUTES.EDIT_PROFILE);

    useFocusEffect(useCallback(() => {
        let active = true;
        setCommerceError(null);
        orderService.summary().then(result => { if (active) setCommerce(result); }).catch(() => { if (active) setCommerceError('Não foi possível atualizar as compras, vendas e avaliações.'); });
        if (user?.id) productService.page({ sellerId: user.id, limit: 1 }).then(result => {
            if (active) setMine(result.pagination.total);
        }).catch(() => {});
        return () => { active = false; setReviewsOpen(false); };
    }, [user?.id]));

    useFocusEffect(useCallback(() => {
        let active = true;
        const refreshPermission = async () => {
            try {
                const notifications = getNotifications();
                const permission = await notifications?.getPermissionsAsync();
                if (active) setNotificationsEnabled(Boolean(permission?.granted));
            } catch {
                // Keep the last known permission if the native query fails.
            } finally {
                if (active) setCheckingNotifications(false);
            }
        };
        setCheckingNotifications(true);
        refreshPermission();
        const listener = AppState.addEventListener('change', state => {
            if (state === 'active') refreshPermission();
        });
        return () => { active = false; listener.remove(); };
    }, []));

    const openSettings = async () => {
        try { await Linking.openSettings(); }
        catch { Alert.alert('Não foi possível abrir as definições', 'Abre as definições do dispositivo e seleciona a Figo.'); }
    };

    const signOut = () => Alert.alert('Terminar sessão?', 'Podes voltar a entrar quando quiseres.', [
        { text: 'Cancelar', style: 'cancel' },
        {
            text: 'Sair', style: 'destructive', onPress: async () => {
                try { await logout(); }
                catch { Alert.alert('Não foi possível terminar sessão', 'Confirma a ligação e tenta novamente para desligar esta conta do dispositivo.'); }
            },
        },
    ]);

    const changeNotifications = async enabled => {
        if (checkingNotifications || updatingNotifications) return;
        if (!enabled) {
            // OS permission is the source of truth; a local toggle would be
            // overwritten by the existing registration on app foreground.
            Alert.alert('Desativar notificações', 'Podes desativar as notificações da Figo nas definições do dispositivo.', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Abrir definições', onPress: openSettings },
            ]);
            return;
        }
        setUpdatingNotifications(true);
        try {
            const status = await registerPushNotifications({ requestPermission: true });
            if (status === 'registered') setNotificationsEnabled(true);
            else if (status === 'denied') {
                setNotificationsEnabled(false);
                Alert.alert('Permissão necessária', 'Ativa as notificações nas definições do dispositivo.', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Abrir definições', onPress: openSettings },
                ]);
            } else if (status === 'unavailable') {
                Alert.alert('Notificações indisponíveis', 'As notificações não estão disponíveis nesta execução da aplicação.');
            }
        } catch {
            Alert.alert('Não foi possível ativar', 'Confirma a ligação e tenta novamente.');
        } finally { setUpdatingNotifications(false); }
    };

    return <Screen scroll contentContainerStyle={styles.page}>
        {reviewsOpen ? <ReviewsSheet key={user.id} sellerId={user.id} sellerName={user.name} onClose={() => setReviewsOpen(false)}
            onOpenProfile={authorId => navigation.navigate(ROUTES.SELLER_PROFILE, { sellerId: authorId })} /> : null}
        <View style={styles.hero}>
            <View pointerEvents="none" accessible={false} style={styles.heroBackdrop}>
                <View style={styles.heroTint} />
                <View style={[styles.heroCurve, {
                    width: heroWidth * 1.6,
                    height: heroWidth * 1.2,
                    borderRadius: heroWidth,
                    top: -heroWidth * 0.7,
                    left: -heroWidth * 0.3,
                }]} />
            </View>
            <View style={styles.header}>
                <Text accessibilityRole="header" style={[sharedStyles.screenTitle, styles.title]}>Perfil</Text>
            </View>
            <View pointerEvents="box-none" style={[styles.profile, fontScale > 1.15 && styles.profileLargeText]}>
                <View style={styles.avatarFrame}>
                    <ProfileAvatar uri={user.avatar} name={user.name} size={88} />
                </View>
                <Text style={styles.name}>{user.name}</Text>
                {commerce ? <ProfileReputationCard reputation={commerce.reputation} onPress={() => setReviewsOpen(true)} /> : null}
                <Text style={styles.email}>{user.email}</Text>
                <View style={styles.location}>
                    <Ionicons accessible={false} name="location-sharp" size={16} color="#D95151" />
                    <Text style={styles.locationText}>{locationLabel(profileLocation(user.location))}</Text>
                </View>
            </View>
        </View>

        {commerceError ? <Text accessibilityRole="alert" style={styles.commerceError}>{commerceError}</Text> : null}
        <View style={styles.menu}>
            <MenuItem icon="create-outline" label="Editar perfil" description="Atualiza os teus dados e fotografia" onPress={editProfile} />
            <MenuItem
                icon="leaf-outline" label="Os meus anúncios" description="Consulta e gere os teus anúncios"
                detail={mine ?? '—'} onPress={() => navigation.navigate(ROUTES.MY_PRODUCTS)}
            />
            <MenuItem
                icon="heart-outline" label="Os meus favoritos" description="Guarda os anúncios de que mais gostas"
                detail={favoriteIds.length} onPress={() => navigation.navigate(ROUTES.FAVORITES)}
            />
            <MenuItem
                icon="basket-outline" label="As minhas encomendas" description="Acompanha as tuas compras no chat"
                detail={commerce ? `${commerce.ordersCount} ${commerce.ordersCount === 1 ? 'finalizada' : 'finalizadas'}` : '—'}
                onPress={() => navigation.navigate(ROUTES.ORDERS, { role: 'buyer' })}
            />
            <MenuItem
                icon="storefront-outline" label="As minhas vendas" description="Acompanha as tuas vendas no chat"
                detail={commerce ? `${commerce.salesCount} ${commerce.salesCount === 1 ? 'finalizada' : 'finalizadas'}` : '—'}
                onPress={() => navigation.navigate(ROUTES.ORDERS, { role: 'seller' })}
            />
            <MenuItem
                icon="document-text-outline" label="Informação legal" description="Termos, privacidade e regras"
                onPress={() => navigation.navigate(ROUTES.LEGAL_INFO)}
            />
            <View style={styles.item}>
                <MenuIcon name="notifications-outline" />
                <View style={styles.itemCopy}>
                    <Text style={styles.itemLabel}>Ativar notificações</Text>
                    <Text style={styles.itemDescription}>Recebe avisos de novas mensagens</Text>
                </View>
                <Switch
                    accessibilityLabel="Ativar notificações"
                    accessibilityHint="Para desativar, abre as definições do dispositivo."
                    accessibilityState={{ busy: checkingNotifications || updatingNotifications }}
                    value={notificationsEnabled}
                    disabled={checkingNotifications || updatingNotifications}
                    onValueChange={changeNotifications}
                    trackColor={{ false: '#D9D5DE', true: colors.primaryDarkFigo }}
                    thumbColor={colors.surface}
                    ios_backgroundColor="#D9D5DE"
                    style={styles.notificationSwitch}
                />
            </View>
        </View>
        <Button title="Terminar sessão" icon="log-out-outline" variant="secondary" onPress={signOut} style={styles.logout} />
    </Screen>;
}

function MenuIcon({ name }) {
    return <View accessible={false} style={styles.itemIcon}>
        <Ionicons name={name} size={26} color={colors.primaryDarkFigo} />
    </View>;
}

function MenuItem({ icon, label, description, detail, onPress }) {
    return <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}${detail != null ? `: ${detail}` : ''}`}
        accessibilityHint={description}
        onPress={onPress}
        style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
        <MenuIcon name={icon} />
        <View style={styles.itemCopy}>
            <Text style={styles.itemLabel}>{label}</Text>
            <Text style={styles.itemDescription}>{description}</Text>
        </View>
        {detail != null ? <View style={styles.detailBadge}><Text style={styles.detail}>{detail}</Text></View> : null}
        <Ionicons name="chevron-forward" size={18} color={profileColors.muted} />
    </Pressable>;
}

const styles = StyleSheet.create({
    page: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingTop: spacing.md, gap: 16 },
    hero: { marginHorizontal: -spacing.md, paddingHorizontal: spacing.md, paddingBottom: 2 },
    heroBackdrop: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    heroTint: { ...StyleSheet.absoluteFillObject, top: 40, backgroundColor: '#F5EFF7' },
    heroCurve: { position: 'absolute', backgroundColor: colors.background },
    header: { minHeight: 44, flexDirection: 'row', alignItems: 'center' },
    title: { paddingLeft: 4 },
    profile: { alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: -28 },
    profileLargeText: { marginTop: 0 },
    avatarFrame: {
        padding: 3, borderRadius: 50, backgroundColor: colors.surface, marginBottom: 7,
        shadowColor: '#49394D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 2,
    },
    name: { color: profileColors.text, fontSize: 24, fontWeight: '700', letterSpacing: -0.5, textAlign: 'center' },
    email: { color: profileColors.muted, fontSize: 14, textAlign: 'center', marginTop: 3 },
    commerceError: { color: colors.error, fontSize: 13, textAlign: 'center' },
    location: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 5 },
    locationText: { color: colors.primaryDarkFigo, fontSize: 14, flexShrink: 1, textAlign: 'center' },
    menu: { gap: 8 },
    item: { minHeight: 60, padding: 8, paddingRight: 12, borderRadius: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 11 },
    itemIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: profileColors.iconBackground, alignItems: 'center', justifyContent: 'center' },
    itemCopy: { flex: 1, minWidth: 0, gap: 3 },
    itemLabel: { color: profileColors.text, fontSize: 15, fontWeight: '600' },
    itemDescription: { color: profileColors.muted, fontSize: 13, lineHeight: 19 },
    detailBadge: { flexShrink: 1, maxWidth: '38%', minWidth: 30, minHeight: 29, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: profileColors.iconBackground },
    detail: { color: colors.primaryDarkFigo, fontSize: 13, fontWeight: '600', textAlign: 'center' },
    notificationSwitch: { marginLeft: 1 },
    logout: { minHeight: 48, borderRadius: 14, borderWidth: 1.5, marginTop: 1 },
    pressed: { opacity: 0.7 },
});
