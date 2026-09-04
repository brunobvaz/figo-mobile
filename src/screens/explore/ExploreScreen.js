import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Chip from '../../components/common/Chip';
import Input from '../../components/common/Input';
import Header from '../../components/layout/Header';
import Screen from '../../components/layout/Screen';
import ProductList from '../../components/product/ProductList';
import mockCategories from '../../data/mockCategories';
import useProducts from '../../hooks/useProducts';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function ExploreScreen({ navigation, route }) {
    const { searchProducts } = useProducts();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('Todos');
    const [nearbyOnly, setNearbyOnly] = useState(false);

    useEffect(() => {
        if (route.params?.category) setCategory(route.params.category);
    }, [route.params?.category]);

    const results = useMemo(() => searchProducts(query, category).filter((item) =>
        !nearbyOnly || parseFloat(item.distance.replace(',', '.')) <= 5),
        [searchProducts, query, category, nearbyOnly]);

    return <Screen contentContainerStyle={styles.page}>
        <Header
            title="Explorar"
            subtitle={`${results.length} produtos locais`}
        />
        <Input
            placeholder="O que procuras?"
            value={query}
            onChangeText={setQuery}
        />

        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.chips}
        >
            {
                mockCategories.map((item) =>
                    <Chip
                        key={item}
                        label={item}
                        selected={category === item}
                        onPress={() => setCategory(item)}
                    />)}
        </ScrollView>
        <View
            style={styles.filters}>
            <Chip
                label="Até 5 km"
                variant="outlined"
                selected={nearbyOnly}
                onPress={() => setNearbyOnly((value) => !value)}
            />
            <Text
                style={styles.future}
            >
                Preço e disponibilidade em breve
            </Text>
        </View>
        <ProductList
            products={results}
            onProductPress={(item) => navigation.navigate('ProductDetails', { productId: item.id })}
            contentContainerStyle={styles.list}
        />
    </Screen>
        ;
}
const styles = StyleSheet.create({
    page: { gap: spacing.sm },
    categoryScroll: { flexGrow: 0 },
    chips: { gap: spacing.sm, paddingVertical: spacing.sm },
    filters: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    future: { flex: 1, color: colors.textMuted, fontSize: 11 },
    list: { paddingBottom: 110 }
});
