import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Screen from '../../components/layout/Screen';
import useAuth from '../../hooks/useAuth';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function EditProfileScreen({ navigation }) {
    const { user, updateProfile, updateAvatar } = useAuth();
    const [form, setForm] = useState({ name: user.name, city: user.location?.city || '', postalCode: user.location?.postalCode || '' });
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
    const save = async () => {
        if (!form.name.trim() || !form.city.trim() || !/^\d{4}-\d{3}$/.test(form.postalCode)) return Alert.alert('Dados inválidos', 'Preenche o nome, cidade e código postal no formato 0000-000.');
        setSaving(true);
        try { await updateProfile({ name: form.name, location: { city: form.city, postalCode: form.postalCode } }); navigation.goBack(); }
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
        <Input
            label="Cidade"
            value={form.city}
            onChangeText={update('city')}
        />
        <Input
            label="Código postal"
            value={form.postalCode}
            onChangeText={update('postalCode')}
            keyboardType="numbers-and-punctuation"
        />
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
    title: { color: colors.text, fontSize: 26, fontWeight: '800' }
});
