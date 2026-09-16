import { useFeedback } from '../../context/FeedbackContext';
import { ROUTES } from '../../navigation/routes';
import { useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import AddressSelect from '../../components/common/AddressSelect';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import Screen from '../../components/layout/Screen';
import useAuth from '../../hooks/useAuth';
import { profileNameFields } from '../../utils/profileName';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

const editColors = {
    text: colors.text,
    muted: colors.textMuted,
    lavender: colors.surfaceSoft,
    iconBackground: colors.surfaceSoft,
    danger: '#DF3450',
    dangerBackground: '#FFF1F3',
};

export default function EditProfileScreen({ navigation }) {
    const { user, updateProfile, updateAvatar } = useAuth();
    const notify = useFeedback();
    const [errors, setErrors] = useState({});
    const { width, fontScale } = useWindowDimensions();
    const [form, setForm] = useState(() => ({ ...profileNameFields(user), location: { municipalityCode: user.location?.municipalityCode || '', parishCode: user.location?.parishCode || '' } }));
    const lastNameInput = useRef(null);
    const scroll = useRef(null);
    const fieldPositions = useRef({});
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const update = key => value => { setErrors(current => ({ ...current, [key]: undefined })); setForm(current => ({ ...current, [key]: value })); };
    const save = async () => {
        if (saving || uploadingPhoto) return;
        const firstName = form.firstName.trim();
        const lastName = form.lastName.trim();
        const nextErrors = {};
        if (firstName.length < 2 || firstName.length > 60) nextErrors.firstName = 'Indica entre 2 e 60 caracteres.';
        if (lastName.length < 2 || lastName.length > 80) nextErrors.lastName = 'Indica entre 2 e 80 caracteres.';
        if (!form.location.municipalityCode || !form.location.parishCode) nextErrors.location = 'Seleciona o concelho e a freguesia.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            Keyboard.dismiss();
            const first = ['firstName', 'lastName', 'location'].find(key => nextErrors[key]);
            requestAnimationFrame(() => scroll.current?.scrollTo({ y: Math.max(0, (fieldPositions.current[first] || 0) - 16), animated: true }));
            return;
        }
        Keyboard.dismiss();
        setSaving(true);
        try { await updateProfile({ firstName, lastName, location: form.location }); navigation.goBack(); notify('Perfil atualizado'); }
        catch (error) { Alert.alert('Não foi possível guardar', error.message); }
        finally { setSaving(false); }
    };
    const choosePhoto = async () => {
        if (saving || uploadingPhoto) return;
        Keyboard.dismiss();
        setUploadingPhoto(true);
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) return Alert.alert('Permissão necessária', 'Autoriza o acesso às fotografias para escolher uma imagem de perfil.');
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
            if (result.canceled) return;
            const asset = result.assets[0];
            if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) return Alert.alert('Imagem demasiado grande', 'Escolhe uma fotografia com menos de 5 MB.');
            await updateAvatar(asset);
            notify('Fotografia atualizada');
        }
        catch (error) { Alert.alert('Não foi possível carregar', error.message); }
        finally { setUploadingPhoto(false); }
    };

    return <Screen scroll scrollRef={scroll} safeAreaEdges={['bottom', 'left', 'right']} contentContainerStyle={styles.page}>
        <View style={[styles.photoSection, (width < 350 || fontScale > 1.3) && styles.photoSectionStacked]}>
            <View style={styles.avatarContainer}>
                <Avatar uri={user.avatar} name={user.name} size={100} />
            </View>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={user.avatar ? 'Alterar fotografia' : 'Adicionar fotografia'}
                accessibilityHint="Escolhe uma nova imagem de perfil."
                accessibilityState={{ disabled: saving || uploadingPhoto, busy: uploadingPhoto }}
                disabled={saving || uploadingPhoto}
                onPress={choosePhoto}
                style={({ pressed }) => [styles.photoCard, (pressed || saving || uploadingPhoto) && styles.dimmed]}
            >
                <View style={styles.photoCopy}>
                    <Text style={styles.photoTitle}>{user.avatar ? 'Alterar fotografia' : 'Adicionar fotografia'}</Text>
                    <Text style={styles.photoDescription}>{uploadingPhoto ? 'A atualizar a fotografia…' : 'Escolhe uma nova imagem de perfil'}</Text>
                </View>
                {uploadingPhoto ? <LoadingIndicator size="small" color={colors.primaryDarkFigo} accessibilityLabel="A atualizar a fotografia" />
                    : <Ionicons name="chevron-forward" size={21} color={colors.primaryDarkFigo} />}
            </Pressable>
        </View>

        <View style={styles.field} onLayout={event => { fieldPositions.current.firstName = event.nativeEvent.layout.y; }}>
            <Text style={styles.label}>Nome</Text>
            <View style={[styles.nameField, errors.firstName && styles.fieldError, saving && styles.dimmed]}>
                <View pointerEvents="none" accessible={false} style={styles.nameIcon}>
                    <Ionicons name="person-outline" size={23} color={colors.primaryDarkFigo} />
                </View>
                <TextInput
                    accessibilityLabel="Nome"
                    value={form.firstName}
                    onChangeText={update('firstName')}
                    editable={!saving}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="given-name"
                    textContentType="givenName"
                    maxLength={60}
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameInput.current?.focus()}
                    style={styles.nameInput}
                />
            </View>
        </View>
        {errors.firstName ? <Text accessibilityRole="alert" style={styles.error}>{errors.firstName}</Text> : null}
        <View style={styles.field} onLayout={event => { fieldPositions.current.lastName = event.nativeEvent.layout.y; }}>
            <Text style={styles.label}>Apelido</Text>
            <View style={[styles.nameField, errors.lastName && styles.fieldError, saving && styles.dimmed]}>
                <View pointerEvents="none" accessible={false} style={styles.nameIcon}>
                    <Ionicons name="person-outline" size={23} color={colors.primaryDarkFigo} />
                </View>
                <TextInput
                    ref={lastNameInput}
                    accessibilityLabel="Apelido"
                    value={form.lastName}
                    onChangeText={update('lastName')}
                    editable={!saving}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="family-name"
                    textContentType="familyName"
                    maxLength={80}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    style={styles.nameInput}
                />
            </View>
        </View>
        {errors.lastName ? <Text accessibilityRole="alert" style={styles.error}>{errors.lastName}</Text> : null}
        <View style={styles.field} onLayout={event => { fieldPositions.current.location = event.nativeEvent.layout.y; }}>
            <Text style={styles.label}>Localização</Text>
            <AddressSelect compact disabled={saving} {...form.location} onChange={update('location')} />
            {errors.location ? <Text accessibilityRole="alert" style={styles.error}>{errors.location}</Text> : null}
        </View>

        <View style={styles.accountSection}>
            <View style={styles.accountHeading}>
                <Text accessibilityRole="header" style={styles.sectionTitle}>Conta</Text>
            </View>
            <AccountOption
                icon="lock-closed-outline"
                title="Desativar temporariamente"
                disabled={saving || uploadingPhoto}
                onPress={() => navigation.navigate(ROUTES.ACCOUNT_ACTION, { mode: 'deactivate' })}
                description="A tua conta ficará inativa até que decidas reativá-la."
            />
            <AccountOption
                icon="trash-outline"
                title="Remover conta"
                disabled={saving || uploadingPhoto}
                onPress={() => navigation.navigate(ROUTES.ACCOUNT_ACTION, { mode: 'delete' })}
                description="Elimina a tua conta de forma permanente."
                destructive
            />
            <View style={styles.notice}>
                <Ionicons accessible={false} name="information-circle-outline" size={23} color={colors.primaryDarkFigo} />
                <View style={styles.noticeCopy}>
                    <Text style={styles.noticeTitle}>Importante</Text>
                    <Text style={styles.noticeText}>A remoção é permanente. Antes de confirmares, poderás consultar o que acontece aos teus anúncios, favoritos e dados.</Text>
                </View>
            </View>
        </View>
        <Button
            title="Guardar alterações"
            icon="save-outline"
            loading={saving}
            disabled={uploadingPhoto}
            onPress={save}
            style={styles.saveButton}
        />
    </Screen>;
}

function AccountOption({ icon, title, description, destructive = false, onPress, disabled }) {
    return <Pressable
        disabled={disabled}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={`${title}. ${description}`}
        style={styles.accountOption}
    >
        <View accessible={false} style={[styles.accountIcon, destructive && styles.dangerIcon]}>
            <Ionicons name={icon} size={29} color={destructive ? editColors.danger : colors.primaryDarkFigo} />
        </View>
        <View style={styles.accountCopy}>
            <Text style={styles.accountTitle}>{title}</Text>
            <Text style={styles.accountDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={19} color="#626478" />
    </Pressable>;
}

const styles = StyleSheet.create({
    page: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 18, paddingTop: 22, paddingBottom: spacing.lg },
    photoSection: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingVertical: 8, marginBottom: 2 },
    photoSectionStacked: { flexDirection: 'column', alignItems: 'stretch', gap: 16 },
    avatarContainer: { alignSelf: 'center' },
    photoCard: { flex: 1, minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderRadius: 20, backgroundColor: editColors.lavender },
    photoCopy: { flex: 1, minWidth: 0, gap: 4 },
    photoTitle: { color: colors.primaryDarkFigo, fontSize: 16, fontWeight: '700' },
    photoDescription: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
    field: { gap: 8 },
    fieldError: { borderColor: colors.error },
    error: { color: colors.error, fontSize: 13, lineHeight: 19 },
    label: { color: editColors.text, fontSize: 15, fontWeight: '600' },
    nameField: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, borderRadius: 14, borderWidth: 1, borderColor: '#E4E1E8', backgroundColor: colors.surface },
    nameIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: editColors.iconBackground },
    nameInput: { flex: 1, minWidth: 0, minHeight: 50, color: editColors.text, fontSize: 16, paddingVertical: 10, paddingRight: 12 },
    accountSection: { gap: 10, borderTopWidth: 1, borderTopColor: '#E7E1E5', paddingTop: 16, marginTop: 3 },
    accountHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 2 },
    sectionTitle: { color: editColors.text, fontSize: 22, fontWeight: '700' },
    accountOption: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 76, padding: 10, paddingRight: 14, borderRadius: 16, backgroundColor: colors.surface },
    accountIcon: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: editColors.iconBackground },
    dangerIcon: { backgroundColor: editColors.dangerBackground },
    accountCopy: { flex: 1, minWidth: 0, gap: 3 },
    accountTitle: { color: editColors.text, fontSize: 15, fontWeight: '700' },
    accountDescription: { color: editColors.muted, fontSize: 14, lineHeight: 21 },
    notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 15, backgroundColor: editColors.lavender, marginTop: 2 },
    noticeCopy: { flex: 1, minWidth: 0, gap: 4 },
    noticeTitle: { color: colors.primaryDarkFigo, fontSize: 15, fontWeight: '700' },
    noticeText: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
    saveButton: { minHeight: 52, borderRadius: 15, marginTop: -4 },
    dimmed: { opacity: 0.6 },
});
