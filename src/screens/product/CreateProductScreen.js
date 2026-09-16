import { useFeedback } from '../../context/FeedbackContext';
import Header from '../../components/layout/Header';
import { FORM_MAX_WIDTH } from '../../theme/layout';
import { ROUTES } from '../../navigation/routes';
import ProductPhotoPicker from '../../components/product/ProductPhotoPicker';
import Loading from '../../components/common/Loading';
import { productService } from '../../services/productService';
import { MAX_PRODUCT_PHOTOS, addSelectedPhotos, editableProductPhotos } from '../../utils/productPhotos';
import ProductFieldHeading from '../../components/product/ProductFieldHeading';
import ProductLocation from '../../components/product/ProductLocation';
import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEASONALITY_OPTIONS } from '../../utils/productSeasonality';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/common/Button';
import Chip from '../../components/common/Chip';
import Input from '../../components/common/Input';
import Screen from '../../components/layout/Screen';
import mockCategories from '../../data/mockCategories';
import useProducts from '../../hooks/useProducts';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import ProductPriceInput from '../../components/product/ProductPriceInput';
import { parsePrice, formatPriceInput } from '../../utils/price';
import { validateProduct } from '../../utils/validators';

const emptyProduct = { title: '', description: '', price: '', unit: '€/kg', category: 'Legumes', self_harvest: false, seasonality: 'all_year', municipalityCode: '', parishCode: '', locality: '', latitude: '', longitude: '', locationSource: 'parish', locationChanged: true, image: '' };

export default function CreateProductScreen({ navigation, route }) {
    const productId = route?.params?.productId;
    const { cacheProducts } = useProducts();
    const [loaded, setLoaded] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        if (!productId) return;
        let active = true;
        setLoaded(null); setLoadError('');
        productService.getById(productId).then(product => { if (active) { cacheProducts([product]); setLoaded(product); } })
            .catch(error => { if (active) setLoadError(error.message); });
        return () => { active = false; };
    }, [productId, attempt, cacheProducts]);
    if (productId && loadError) return <Screen><Text accessibilityRole="alert">{loadError}</Text><Button title="Tentar novamente" onPress={() => setAttempt(value => value + 1)} /></Screen>;
    if (productId && loaded?.id !== productId) return <Loading />;
    return <ProductForm key={productId || 'new'} navigation={navigation} existingProduct={productId ? loaded : null} />;
}

function ProductForm({ navigation, existingProduct }) {
    const { createProduct, updateProduct } = useProducts();
    const notify = useFeedback();
    const scroll = useRef(null);
    const sections = useRef({});
    const sectionLayout = name => event => { sections.current[name] = event.nativeEvent.layout.y; };
    const [form, setForm] = useState(existingProduct ? {
        title: existingProduct.title, description: existingProduct.description, price: formatPriceInput(existingProduct.price), unit: existingProduct.unit,
        self_harvest: ['Frutas', 'Legumes'].includes(existingProduct.category) && existingProduct.self_harvest === true,
        seasonality: existingProduct.seasonality ?? 'all_year',
        locationSource: existingProduct.locationSource, category: existingProduct.category, municipalityCode: existingProduct.address?.municipalityCode || '', parishCode: existingProduct.address?.parishCode || '', locality: existingProduct.address?.locality || '', latitude: '', longitude: '', locationChanged: !existingProduct.address?.version, image: existingProduct.image || ''
    } : { ...emptyProduct });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [photos, setPhotos] = useState(() => editableProductPhotos(existingProduct));
    const [imagesRevision, setImagesRevision] = useState(existingProduct?.imagesRevision || 0);
    const [picking, setPicking] = useState(false);
    const savingRef = useRef(false);
    const pickingRef = useRef(false);
    const update = key => value => {
        setErrors(current => ({ ...current, [key]: undefined }));
        setForm(current => ({ ...current, [key]: value, ...(key === 'category' && !['Frutas', 'Legumes'].includes(value) ? { self_harvest: false } : {}) }));
    };
    const submit = async () => {
        if (savingRef.current || pickingRef.current) return;
        const nextErrors = { ...validateProduct(form), ...(!photos.length ? { photos: 'Adiciona pelo menos uma fotografia do produto.' } : {}) };
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            const section = nextErrors.photos ? 'photos' : nextErrors.title || nextErrors.description || nextErrors.category ? 'product' : nextErrors.price || nextErrors.unit ? 'price' : 'location';
            Keyboard.dismiss();
            requestAnimationFrame(() => scroll.current?.scrollTo({ y: Math.max(0, (sections.current[section] || 0) - 16), animated: true }));
            return;
        }
        const payload = { ...form, price: parsePrice(form.price), imagesRevision };
        savingRef.current = true;
        setSaving(true);
        try {
            if (existingProduct) {
                const item = await updateProduct(existingProduct.id, payload, photos);
                setPhotos(editableProductPhotos(item)); setImagesRevision(item.imagesRevision);
                navigation.goBack();
                notify('Anúncio atualizado');
            } else {
                const item = await createProduct(payload, photos);
                setForm({ ...emptyProduct });
                setPhotos([]); setImagesRevision(0);
                navigation.navigate(ROUTES.PRODUCT_DETAILS, { productId: item.id });
                notify('Anúncio publicado');
            }
        } catch (error) { Alert.alert('Não foi possível guardar', error.message); }
        finally { savingRef.current = false; setSaving(false); }
    };
    const chooseImages = async () => {
        if (savingRef.current || pickingRef.current || photos.length >= MAX_PRODUCT_PHOTOS) return;
        pickingRef.current = true; setPicking(true);
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) return Alert.alert('Permissão necessária', 'Autoriza o acesso às fotografias para escolher imagens do produto.');
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], allowsMultipleSelection: true, allowsEditing: false,
                selectionLimit: MAX_PRODUCT_PHOTOS - photos.length, orderedSelection: true, quality: 0.8,
                preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
                shouldDownloadFromNetwork: true
            });
            if (result.canceled) return;
            const selection = addSelectedPhotos(photos, result.assets);
            setPhotos(selection.photos);
            if (selection.photos.length) setErrors(current => ({ ...current, photos: undefined }));
            const warnings = [selection.tooLarge ? 'Cada fotografia pode ter até 5 MB.' : '', selection.unsupported ? 'Escolhe fotografias JPEG, PNG ou WebP.' : '', selection.excess ? 'Podes adicionar até 6 fotografias.' : ''].filter(Boolean);
            if (warnings.length) Alert.alert('Algumas fotografias não foram adicionadas', warnings.join('\n'));
        } catch (error) { Alert.alert('Não foi possível selecionar as fotografias', error.message); }
        finally { pickingRef.current = false; setPicking(false); }
    };

    return <Screen scroll scrollRef={scroll} maxWidth={FORM_MAX_WIDTH} contentContainerStyle={styles.page}>
        {!existingProduct ? <Header title="O que tens para vender?" subtitle="Prepara o teu anúncio com fotografias e informação clara." /> : null}
        <View onLayout={sectionLayout('photos')}>
          <ProductPhotoPicker photos={photos} disabled={saving || picking} loading={picking} error={errors.photos} onAdd={chooseImages}
            onRemove={index => setPhotos(current => current.filter((_, position) => position !== index))}
            onCover={index => setPhotos(current => [current[index], ...current.filter((_, position) => position !== index)])} />
        </View>
        <FormSection title="Informação do produto" onLayout={sectionLayout('product')}>
          <Input label="Título" placeholder="Ex.: Tomates da horta" value={form.title} editable={!saving} onChangeText={update('title')} error={errors.title} />
          <Input label="Descrição" placeholder="Descreve o produto, a origem e o que o torna especial." value={form.description} editable={!saving} onChangeText={update('description')} multiline error={errors.description} />
          <Choice label="Categoria" items={mockCategories.slice(1)} value={form.category} disabled={saving} onChange={update('category')} />
          {errors.category ? <Text accessibilityRole="alert" style={styles.error}>{errors.category}</Text> : null}
          <View style={styles.field}>
            <ProductFieldHeading title="Sazonalidade" subtitle="Quando está disponível?" />
            <View style={styles.options}>
              {SEASONALITY_OPTIONS.map(option => {
                const selected = form.seasonality === option.value;
                return <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
                  accessibilityState={{ checked: selected, disabled: saving }} disabled={saving} onPress={() => update('seasonality')(option.value)}
                  style={[styles.seasonOption, selected && styles.seasonSelected]}>
                  <Ionicons accessible={false} name={option.icon} size={21} color={selected ? colors.surface : colors.text} />
                  <Text style={[styles.seasonText, selected && styles.seasonSelectedText]}>{option.label}</Text>
                </Pressable>;
              })}
            </View>
          </View>
          {['Frutas', 'Legumes'].includes(form.category) ? <View style={styles.field}>
            <View style={styles.harvestRow}>
              <View style={{ flex: 1 }}><ProductFieldHeading title="Colheita pelo comprador" /></View>
              <Switch accessibilityLabel="O comprador pode colher no local?" value={form.self_harvest} onValueChange={update('self_harvest')} disabled={saving} trackColor={{ true: colors.primaryDarkFigo, false: colors.border }} />
            </View>
            <Text style={styles.activationText}>O comprador pode colher na árvore ou na horta, mediante combinação contigo.</Text>
          </View> : null}
        </FormSection>
        <FormSection title="Preço" onLayout={sectionLayout('price')}>
          <ProductPriceInput hideHeading price={form.price} unit={form.unit} onPriceChange={update('price')} onUnitChange={update('unit')} error={errors.price || errors.unit} disabled={saving} />
        </FormSection>
        <FormSection title="Localização" subtitle="Indica onde está o produto." onLayout={sectionLayout('location')}>
          <ProductLocation form={form} disabled={saving} setForm={change => { setForm(change); setErrors(current => ({ ...current, location: undefined })); }} errors={errors} />
        </FormSection>
        <Text style={styles.activationText}>A entrega e o pagamento são combinados diretamente com o comprador.</Text>
        <Button title={existingProduct ? 'Guardar alterações' : 'Publicar anúncio'} loading={saving} disabled={picking} onPress={submit} />
    </Screen>;
}

function FormSection({ title, subtitle, children, onLayout }) {
  return <View style={styles.card} onLayout={onLayout}>
    <View style={styles.field}><Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.activationText}>{subtitle}</Text> : null}</View>
    {children}
  </View>;
}

function Choice({ label, items, value, onChange, disabled }) {
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
                disabled={disabled}
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
    harvestRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    page: { paddingTop: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxl },
    field: { gap: 10 },
    sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
    error: { color: colors.error, fontSize: 13, lineHeight: 19 },
    activationText: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
    choice: { gap: spacing.sm },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        gap: 20,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        shadowColor: '#30263B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    seasonOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 14, backgroundColor: colors.cream },
    seasonSelected: { backgroundColor: colors.primaryDarkFigo },
    seasonText: { color: colors.text, fontSize: 15, flexShrink: 1 },
    seasonSelectedText: { color: colors.surface, fontWeight: '600' },
    categoryChip: { minWidth: 112, flexGrow: 1, minHeight: 48, justifyContent: 'center', paddingHorizontal: 8, borderRadius: 26 },
    categoryText: { textAlign: 'center' },
    moreChip: { backgroundColor: '#F8F4FA', borderWidth: 1, borderStyle: 'dashed', borderColor: '#E3D6E9' }
});
