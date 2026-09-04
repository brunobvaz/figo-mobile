import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/common/Button';
import Chip from '../../components/common/Chip';
import Input from '../../components/common/Input';
import Screen from '../../components/layout/Screen';
import mockCategories from '../../data/mockCategories';
import useAuth from '../../hooks/useAuth';
import useProducts from '../../hooks/useProducts';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { PRODUCT_UNITS } from '../../utils/constants';
import { validateProduct } from '../../utils/validators';

const emptyProduct = { title: '', description: '', price: '', unit: '€/kg', category: 'Legumes', location: 'Ponte de Lima', image: '' };

export default function CreateProductScreen({ navigation, route }) {
    const { user, enableSeller } = useAuth();
    const { createProduct, updateProduct, getProductById } = useProducts();
    const productId = route?.params?.productId;
    const existingProduct = productId ? getProductById(productId) : null;
    const [form, setForm] = useState(existingProduct ? {
        title: existingProduct.title, description: existingProduct.description, price: String(existingProduct.price), unit: existingProduct.unit,
        category: existingProduct.category, location: existingProduct.location, image: existingProduct.image || ''
    } : { ...emptyProduct, location: user.location?.city || emptyProduct.location });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [imageAsset, setImageAsset] = useState(null);
    const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
    const submit = async () => {
        const nextErrors = validateProduct(form); if (Object.keys(nextErrors).length) return setErrors(nextErrors);
        if (!user.roles?.includes('seller')) return Alert.alert('Perfil de vendedor necessário', 'Ativa primeiro o perfil de vendedor para publicar produtos.');
        if (!imageAsset && !existingProduct?.image) return Alert.alert('Imagem necessária', 'Seleciona uma imagem do produto.');
        const payload = { ...form, price: Number(form.price) };
        setSaving(true);
        try {
            if (existingProduct) {
                await updateProduct(existingProduct.id, payload, imageAsset);
                Alert.alert('Produto atualizado', 'As alterações foram guardadas.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
            } else {
                const item = await createProduct(payload, imageAsset);
                setForm({ ...emptyProduct, location: user.location?.city || emptyProduct.location });
                setImageAsset(null);
                Alert.alert('Anúncio publicado', 'O produto já está disponível no marketplace.', [{ text: 'Ver produto', onPress: () => navigation.navigate('ProductDetails', { productId: item.id }) }]);
            }
        } catch (error) { Alert.alert('Não foi possível guardar', error.message); }
        finally { setSaving(false); }
    };
    const chooseImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return Alert.alert('Permissão necessária', 'Autoriza o acesso às fotografias para escolher uma imagem do produto.');
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
        if (result.canceled) return;
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) return Alert.alert('Imagem demasiado grande', 'Escolhe uma imagem com menos de 5 MB.');
        setImageAsset(asset);
    };

    if (!user.roles?.includes('seller')) return <Screen contentContainerStyle={styles.sellerActivation}>
        <Text style={styles.title}>Começa a vender na DaTerra</Text>
        <Text style={styles.activationText}>Ativa o perfil de vendedor para publicares e gerires os teus produtos.</Text>
        <Button title="Ativar perfil de vendedor" onPress={async () => { try { await enableSeller(); } catch (error) { Alert.alert('Não foi possível ativar', error.message); } }} />
    </Screen>;

    return <Screen scroll contentContainerStyle={styles.page}>
        <Text style={styles.title}>{existingProduct ? 'Editar produto' : 'O que tens para partilhar?'}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Escolher imagem do produto" onPress={chooseImage} style={styles.placeholder}>
            {imageAsset?.uri || existingProduct?.image
                ? <Image source={{ uri: imageAsset?.uri || existingProduct.image }} style={styles.preview} />
                : <><Text style={styles.placeholderIcon}>📷</Text><Text style={styles.placeholderText}>Carregar imagem</Text></>}
        </Pressable>
        <Button title={imageAsset || existingProduct?.image ? 'Alterar imagem' : 'Escolher imagem'} variant="secondary" onPress={chooseImage} />
        <Input
            label="Título"
            value={form.title}
            onChangeText={update('title')}
            error={errors.title} />
        <Input
            label="Descrição"
            value={form.description}
            onChangeText={update('description')}
            multiline
            error={errors.description}
        />
        <Input
            label="Preço"
            value={form.price}
            onChangeText={update('price')}
            keyboardType="decimal-pad"
            error={errors.price}
        />
        <Choice
            label="Unidade"
            items={PRODUCT_UNITS}
            value={form.unit}
            onChange={update('unit')}
        />
        <Choice
            label="Categoria"
            items={mockCategories.slice(1)}
            value={form.category}
            onChange={update('category')}
        />
        <Input
            label="Localização"
            value={form.location}
            onChangeText={update('location')}
            error={errors.location}
        />
        <Button
            title={existingProduct ? 'Guardar alterações' : 'Publicar anúncio'}
            loading={saving}
            onPress={submit}
        />
    </Screen>
        ;
}

function Choice({ label, items, value, onChange }) {
    return <View style={styles.choice}>
        <Text style={styles.label}>{label}</Text>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.options}
        >
            {items.map((item) =>
                <Chip
                    key={item}
                    label={item}
                    selected={item === value}
                    onPress={() => onChange(item)}
                />
            )}
        </ScrollView>
    </View>
        ;
}

const styles = StyleSheet.create({
    page: { paddingTop: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
    sellerActivation: { justifyContent: 'center', gap: spacing.md },
    activationText: { color: colors.textMuted, lineHeight: 22 },
    title: { color: colors.primaryDark, fontSize: 26, fontWeight: '800' },
    placeholder: { height: 150, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: 18, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
    preview: { width: '100%', height: '100%', borderRadius: 18 },
    placeholderIcon: { fontSize: 32 }, placeholderText: { color: colors.textMuted },
    choice: { gap: spacing.sm },
    label: { color: colors.text, fontWeight: '600' },
    options: { gap: spacing.sm }
});
