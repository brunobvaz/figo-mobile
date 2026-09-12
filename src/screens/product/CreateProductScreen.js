import OptimizedImage from '../../components/common/OptimizedImage';
import ProductFieldHeading from '../../components/product/ProductFieldHeading';
import ProductLocation from '../../components/product/ProductLocation';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEASONALITY_OPTIONS } from '../../utils/productSeasonality';
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
import ProductPriceInput from '../../components/product/ProductPriceInput';
import { parsePrice, formatPriceInput } from '../../utils/price';
import { validateProduct } from '../../utils/validators';

const emptyProduct = { title: '', description: '', price: '', unit: '€/kg', category: 'Legumes', seasonality: 'all_year', municipalityCode: '', parishCode: '', locality: '', latitude: '', longitude: '', locationSource: 'parish', locationChanged: true, image: '' };

export default function CreateProductScreen({ navigation, route }) {
    const { user, enableSeller } = useAuth();
    const { createProduct, updateProduct, getProductById } = useProducts();
    const productId = route?.params?.productId;
    const existingProduct = productId ? getProductById(productId) : null;
    const [form, setForm] = useState(existingProduct ? {
        title: existingProduct.title, description: existingProduct.description, price: formatPriceInput(existingProduct.price), unit: existingProduct.unit,
        seasonality: existingProduct.seasonality ?? 'all_year',
        locationSource: existingProduct.locationSource, category: existingProduct.category, municipalityCode: existingProduct.address?.municipalityCode || '', parishCode: existingProduct.address?.parishCode || '', locality: existingProduct.address?.locality || '', latitude: '', longitude: '', locationChanged: !existingProduct.address?.version, image: existingProduct.image || ''
    } : { ...emptyProduct });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [imageAsset, setImageAsset] = useState(null);
    const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
    const submit = async () => {
        const nextErrors = validateProduct(form); if (Object.keys(nextErrors).length) return setErrors(nextErrors);
        if (!user.roles?.includes('seller')) return Alert.alert('Perfil de vendedor necessário', 'Ativa primeiro o perfil de vendedor para publicar produtos.');
        if (!imageAsset && !existingProduct?.image) return Alert.alert('Imagem necessária', 'Seleciona uma imagem do produto.');
        const payload = { ...form, price: parsePrice(form.price) };
        setSaving(true);
        try {
            if (existingProduct) {
                await updateProduct(existingProduct.id, payload, imageAsset);
                Alert.alert('Produto atualizado', 'As alterações foram guardadas.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
            } else {
                const item = await createProduct(payload, imageAsset);
                setForm({ ...emptyProduct });
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
        <View style={styles.card}>
        <ProductFieldHeading title="Fotografia" subtitle="Escolhe uma fotografia que mostre bem o produto." />
        <Pressable accessibilityRole="button" accessibilityLabel="Escolher imagem do produto" onPress={chooseImage} style={styles.placeholder}>
            {imageAsset?.uri || existingProduct?.image
                ? <OptimizedImage source={{ uri: imageAsset?.uri || existingProduct.image }} style={styles.preview} />
                : <><Text style={styles.placeholderIcon}>📷</Text><Text style={styles.placeholderText}>Carregar imagem</Text></>}
        </Pressable>
        <Button title={imageAsset || existingProduct?.image ? 'Alterar imagem' : 'Escolher imagem'} variant="secondary" onPress={chooseImage} />
        </View>
        <View style={styles.card}>
        <ProductFieldHeading title="Título" subtitle="Dá um nome simples e claro ao produto." />
        <Input
            accessibilityLabel="Título"
            value={form.title}
            onChangeText={update('title')}
            error={errors.title} />
        </View>
        <View style={styles.card}>
        <ProductFieldHeading title="Descrição" subtitle="Descreve as características e o estado do produto." />
        <Input
            accessibilityLabel="Descrição"
            value={form.description}
            onChangeText={update('description')}
            multiline
            error={errors.description}
        />
        </View>
        <View style={styles.card}>
        <ProductPriceInput
            price={form.price}
            unit={form.unit}
            onPriceChange={update('price')}
            onUnitChange={update('unit')}
            error={errors.price || errors.unit}
        />
        </View>
        <View style={styles.card}>
        <Choice
            label="Categoria"
            items={mockCategories.slice(1)}
            value={form.category}
            onChange={update('category')}
        />
        </View>
        <View style={styles.card}>
          <ProductFieldHeading title="Sazonalidade" subtitle="Indica em que época do ano o produto está disponível." />
          <View style={styles.options}>
            {SEASONALITY_OPTIONS.map(option => {
              const selected = form.seasonality === option.value;
              return <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
                accessibilityState={{ checked: selected, disabled: saving }} disabled={saving}
                onPress={() => update('seasonality')(option.value)}
                style={[styles.seasonOption, selected && styles.seasonSelected]}>
                <Ionicons name={option.icon} size={21} color={selected ? colors.surface : colors.text} />
                <Text style={[styles.seasonText, selected && styles.seasonSelectedText]}>{option.label}</Text>
              </Pressable>;
            })}
          </View>
        </View>
        <View style={styles.card}>
          <ProductFieldHeading title="Localização" subtitle="Escolhe o concelho e a freguesia onde está o produto." />
          <ProductLocation form={form} setForm={setForm} errors={errors} />
        </View>
        <Button
            title={existingProduct ? 'Guardar alterações' : 'Publicar anúncio'}
            loading={saving}
            onPress={submit}
        />
    </Screen>
        ;
}

function Choice({ label, items, value, onChange }) {
    const [expanded, setExpanded] = useState(false);
    const initialItems = items.slice(0, 5);
    if (value && !initialItems.includes(value)) initialItems[4] = value;
    const visibleItems = expanded ? items : initialItems;
    return <View style={styles.choice}>
        <ProductFieldHeading title={label} subtitle="Seleciona a categoria principal do produto." />
        <View style={styles.options}>
            {visibleItems.map(item => <Chip
                key={item}
                label={item}
                selected={item === value}
                onPress={() => onChange(item)}
                style={styles.categoryChip}
                textStyle={styles.categoryText}
            />)}
            {items.length > 5 ? <Chip
                label={expanded ? '− Menos' : '+ Mais...'}
                onPress={() => setExpanded(current => !current)}
                style={[styles.categoryChip, styles.moreChip]}
                textStyle={[styles.categoryText, { color: colors.primaryDarkFigo }]}
            /> : null}
        </View>
    </View>;
}

const styles = StyleSheet.create({
    page: { paddingTop: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
    sellerActivation: { justifyContent: 'center', gap: spacing.md },
    activationText: { color: colors.textMuted, lineHeight: 22 },
    title: { color: colors.primaryDarkFigo, fontSize: 26, fontWeight: '800' },
    placeholder: { height: 150, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primaryFigo, borderRadius: 18, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
    preview: { width: '100%', height: '100%', borderRadius: 18 },
    placeholderIcon: { fontSize: 32 }, placeholderText: { color: colors.textMuted },
    choice: { gap: spacing.sm },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        gap: 10,
        borderWidth: 1,
        borderColor: '#F0EEEB',
        shadowColor: '#30263B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    seasonOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 14, backgroundColor: colors.cream },
    seasonSelected: { backgroundColor: colors.primaryFigo },
    seasonText: { color: colors.text, fontSize: 15, flexShrink: 1 },
    seasonSelectedText: { color: colors.surface, fontWeight: '600' },
    categoryChip: { flexBasis: '30%', flexGrow: 1, minHeight: 48, justifyContent: 'center', paddingHorizontal: 8, borderRadius: 26 },
    categoryText: { textAlign: 'center' },
    moreChip: { backgroundColor: '#F8F4FA', borderWidth: 1, borderStyle: 'dashed', borderColor: '#E3D6E9' }
});
