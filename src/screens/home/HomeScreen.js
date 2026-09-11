import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/common/Input';
import Header from '../../components/layout/Header';
import Screen from '../../components/layout/Screen';
import ProductList from '../../components/product/ProductList';
import ProducerCard from '../../components/product/ProducerCard';
import HomeDiscover from '../../components/home/HomeDiscover';
import useAuth from '../../hooks/useAuth';
import useProducts from '../../hooks/useProducts';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { formatLocation } from '../../utils/formatters';
import { discoveryProducts, nearbyProducts, quickCategories } from '../../utils/homeDiscovery';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { products, isLoading } = useProducts();
  const [query, setQuery] = useState('');
  const feed = useMemo(() => discoveryProducts(products), [products]);
  const nearby = useMemo(() => nearbyProducts(feed), [feed]);
  const producers = useMemo(() => [...new Map(feed.filter(item => item.seller?.id)
    .map(item => [item.seller.id, item.seller])).values()], [feed]);
  // Each shortcut replaces the complete filter payload, avoiding stale tab filters.
  const explore = (filters = {}) => navigation.navigate(ROUTES.EXPLORE, { filters });
  const openProduct = item => navigation.navigate(ROUTES.PRODUCT_DETAILS, { productId: item.id });
  const openProducers = () => {
    // TODO: connect a producer directory when that screen exists.
    Alert.alert('Produtores', 'Toca num produtor para conhecer o seu perfil e produtos.');
  };
  const sectionHeader = (title, onPress) => <View style={styles.sectionHeader}>
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver todos: ${title}`} onPress={onPress} style={styles.viewAll}>
      <Text style={styles.link}>Ver todos →</Text>
    </Pressable>
  </View>;
  const productSection = (title, items, filters, variant) => items.length ? <View style={[styles.section, styles[variant]]}>
    {sectionHeader(title, () => explore(filters))}
    <ProductList products={items} horizontal variant={variant} onProductPress={openProduct} />
  </View> : null;
  return <Screen scroll contentContainerStyle={styles.page}>
    <Header title={`Olá, ${user?.name?.split(' ')[0] || 'Bruno'}`} subtitle="Descobre o que há perto de ti" location={formatLocation(user?.location)} right={
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => navigation.navigate(ROUTES.PROFILE)}><Avatar uri={user?.avatar} name={user?.name || ''} size={48} /></Pressable>
    } />
    <Input leadingIcon="search-outline" accessibilityLabel="Pesquisar produtos locais" placeholder="Pesquisar produtos locais..." value={query} onChangeText={setQuery} returnKeyType="search" onSubmitEditing={() => explore({ query: query.trim() })} />
    <View style={styles.categories}>
      {quickCategories.map(([name, emoji]) => <Pressable key={name} accessibilityRole="button" accessibilityLabel={name} style={styles.category} onPress={() => explore(name === 'Mais' ? {} : { category: name })}>
        <Text style={styles.emoji}>{emoji}</Text><Text numberOfLines={1} style={styles.categoryLabel}>{name}</Text>
      </Pressable>)}
    </View>
    {isLoading ? <ActivityIndicator color={colors.primaryFigo} /> : null}
    {productSection('Produtos em destaque', feed.filter(item => item.featured === true), { featured: true }, 'featured')}
    {productSection('Perto de ti', nearby, { radiusKm: 10, sortBy: 'distance', viewMode: 'list' }, 'nearby')}
    {productSection('Da época', feed.filter(item => item.seasonal === true), { seasonal: true }, 'seasonal')}
    {producers.length ? <View style={[styles.section, styles.producerSection]}>
      {sectionHeader('Produtores em destaque', openProducers)}
      <FlatList horizontal data={producers} keyExtractor={item => String(item.id)} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.producers}
        renderItem={({ item }) => <ProducerCard producer={item} onPress={() => navigation.navigate(ROUTES.SELLER_PROFILE, { sellerId: item.id })} />} />
    </View> : null}
    {!isLoading && !feed.length ? <Text style={styles.help}>Ainda não há produtos disponíveis para descobrir.</Text> : null}
    <HomeDiscover />
  </Screen>;
}
const styles = StyleSheet.create({
  page: { paddingTop: spacing.md, gap: spacing.md },
  section: { gap: spacing.xs, marginHorizontal: -spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderRadius: 18 },
  featured: { backgroundColor: '#FFEA99' },
  nearby: { backgroundColor: '#EDE9FE' },
  seasonal: { backgroundColor: '#D1FAE5' },
  producerSection: { backgroundColor: '#FCE7F3' },
  sectionHeader: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: spacing.xs },
  title: { fontSize: 21, color: colors.text, fontWeight: '700', flexShrink: 1 },
  viewAll: { minHeight: 44, justifyContent: 'center' },
  link: { color: colors.primaryDarkFigo, fontWeight: '600', fontSize: 14 },
  help: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  producers: { gap: spacing.md, paddingVertical: spacing.sm },
  categories: { flexDirection: 'row', gap: 6 },
  category: { flex: 1, minWidth: 44, alignItems: 'center', gap: 6, paddingVertical: 12, backgroundColor: colors.cream, borderRadius: 14 },
  emoji: { fontSize: 23 }, categoryLabel: { fontSize: 10, color: colors.text },
});
