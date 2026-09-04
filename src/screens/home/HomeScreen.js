import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/common/Avatar';
import IconButton from '../../components/common/IconButton';
import Input from '../../components/common/Input';
import Header from '../../components/layout/Header';
import Screen from '../../components/layout/Screen';
import ProductList from '../../components/product/ProductList';
import mockCategories from '../../data/mockCategories';
import useAuth from '../../hooks/useAuth';
import useProducts from '../../hooks/useProducts';
import { ROUTES } from '../../navigation/routes';
import sharedStyles from '../../theme/SharedStyles';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { formatLocation } from '../../utils/formatters';

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const { products } = useProducts();
    const open = (item) => navigation.navigate('ProductDetails', { productId: item.id });

    return <Screen scroll contentContainerStyle={styles.page}>
        <Header
            title={`Olá, ${user.name.split(' ')[0]}`}
            subtitle="Descobre o que há perto de ti"
            location={formatLocation(user.location)}
            right={
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Abrir perfil"
                    onPress={() => navigation.navigate(ROUTES.PROFILE)}
                >
                    <Avatar uri={user.avatar} name={user.name} size={48} />
                </Pressable>
            }
        />

        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pesquisar produtos locais"
            onPress={() => navigation.navigate(ROUTES.EXPLORE)}
        >
            <View pointerEvents="none">
                <Input placeholder="Pesquisar produtos locais..." editable={false} />
            </View>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {mockCategories.slice(1).map((category) =>
                <IconButton
                    key={category}
                    icon={category === 'Frutas' ? '🍊' : category === 'Legumes' ? '🥬' : category === 'Mel' ? '🍯' : '🌾'}
                    label={category}
                    onPress={() => navigation.navigate(ROUTES.EXPLORE, { category })}
                />)}
        </ScrollView>
        <Section
            title="Perto de ti"
            action="Ver tudo"
            onAction={() => navigation.navigate(ROUTES.EXPLORE)}
        >
            <ProductList
                products={products.slice(0, 5)}
                horizontal
                onProductPress={open}
            />
        </Section>
        <Section title="Produtos recentes">
            <ProductList products={products.slice(0, 4)} horizontal onProductPress={open} />
        </Section>
    </Screen>;
}

function Section({ title, action, onAction, children }) {
    return <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={sharedStyles.sectionTitle}>{title}</Text>
            {action ?
                <Text onPress={onAction} style={styles.action}>{action}</Text>
                :
                null
            }
        </View>
        {children}
    </View>;
}

const styles = StyleSheet.create({
    page: { paddingTop: spacing.md, gap: spacing.md },
    categories: { gap: spacing.sm, paddingVertical: spacing.sm },
    section: { gap: spacing.xs },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    action: { color: colors.primary, fontWeight: '700' }
});
