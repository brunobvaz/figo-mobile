import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import AddressSelect from '../../components/common/AddressSelect';
import Input from '../../components/common/Input';
import Screen from '../../components/layout/Screen';
import useAuth from '../../hooks/useAuth';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function EditProfileScreen({ navigation }) {
    const { user, updateProfile, updateAvatar } = useAuth();
    const [form, setForm] = useState({ name: user.name, location: { municipalityCode: user.location?.municipalityCode || '', parishCode: user.location?.parishCode || '' } });
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
    const save = async () => {
        if (form.name.trim().length < 2) return Alert.alert('Nome inválido', 'Indica o teu nome.');
        if (!form.location.municipalityCode || !form.location.parishCode) return Alert.alert('Localização em falta', 'Seleciona o concelho e a freguesia.');
        setSaving(true);
        try { await updateProfile({ name: form.name, location: form.location }); navigation.goBack(); }
        catch (error) { Alert.alert('Não foi possível guardar', error.message); }
        finally { setSaving(false); }
    };
    const choosePhoto = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return Alert.alert('Permissão necessária', 'Autoriza o acesso às fotografias para escolher uma imagem de perfil.');
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        if (result.canceled) return;
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) return Alert.alert('Imagem demasiado grande', 'Escolhe uma fotografia com menos de 5 MB.');
        setUploadingPhoto(true);
        try { await updateAvatar(asset); }
        catch (error) { Alert.alert('Não foi possível carregar', error.message); }
        finally { setUploadingPhoto(false); }
    };

    return <Screen scroll contentContainerStyle={styles.page}>
        <Text style={styles.title}>Editar perfil</Text>
        <Avatar uri={user.avatar} name={user.name} size={80} />
        <Button title={user.avatar ? 'Alterar fotografia' : 'Adicionar fotografia'} variant="secondary" loading={uploadingPhoto} onPress={choosePhoto} />
        <Input
            label="Nome"
            value={form.name}
            onChangeText={update('name')}
        />
        <Text style={styles.label}>Localização</Text>
        <AddressSelect {...form.location} onChange={update('location')} />
        <Button
            title="Guardar alterações"
            loading={saving}
            disabled={uploadingPhoto}
            onPress={save}
        />
    </Screen>
        ;
}
const styles = StyleSheet.create({
    page: { gap: spacing.md, paddingTop: spacing.lg },
    label: { color: colors.text, fontWeight: '600' },
    title: { color: colors.text, fontSize: 26, fontWeight: '800' }
});
