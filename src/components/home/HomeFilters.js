import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../common/Button';
import colors from '../../theme/colors';
import categories from '../../data/mockCategories';

export const PRICE_FILTERS = [
  { label: 'Qualquer preço', value: '' },
  { label: 'Até 5 €', value: '5', maxPrice: 5 },
  { label: 'Até 10 €', value: '10', maxPrice: 10 },
  { label: '10 € a 25 €', value: '10-25', minPrice: 10, maxPrice: 25 },
  { label: 'A partir de 25 €', value: '25+', minPrice: 25 }
];
const sorts = [{ label: 'Mais recentes', value: 'recent' }, { label: 'Preço: menor primeiro', value: 'price_asc' }, { label: 'Preço: maior primeiro', value: 'price_desc' }, { label: 'Mais próximos', value: 'distance' }];
const emojis = { Frutas: '🍊', Legumes: '🥬', Ovos: '🥚', Mel: '🍯', Laticínios: '🧀', Padaria: '🍞', Bebidas: '🧃', Conservas: '🫙', Outros: '🌱' };
export default function HomeFilters({ category, setCategory, price, setPrice, sort, setSort, radius, setRadius, nearby, onNearbyChange, locating, clear, query, clearQuery }) {
  const [menu, setMenu] = useState(null);
  const priceLabel = PRICE_FILTERS.find(item => item.value === price)?.label;
  const active = [
    ...(nearby ? [{ label: `Até ${radius} km`, remove: () => onNearbyChange(false) }] : []),
    ...(category ? [{ label: `${emojis[category]} ${category}`, remove: () => setCategory('') }] : []),
    ...(price ? [{ label: priceLabel, remove: () => setPrice('') }] : []),
    ...(sort !== 'recent' ? [{ label: sorts.find(item => item.value === sort)?.label, remove: () => setSort('recent') }] : []),
    ...(query.trim() ? [{ label: query.trim(), remove: clearQuery }] : [])
  ];
  const options = menu === 'category' ? categories.map(value => ({ label: value, value: value === 'Todos' ? '' : value }))
    : menu === 'price' ? PRICE_FILTERS : menu === 'sort' ? sorts.filter(item => nearby || item.value !== 'distance')
    : [5, 10, 25, 50, 100].map(value => ({ label: `Até ${value} km`, value }));
  const selected = menu === 'category' ? category : menu === 'price' ? price : menu === 'sort' ? sort : radius;
  const choose = value => {
    if (menu === 'category') setCategory(value);
    else if (menu === 'price') setPrice(value);
    else if (menu === 'sort') setSort(value);
    else { setRadius(value); onNearbyChange(true); }
    setMenu(null);
  };
  return <View style={styles.wrapper}>
    <View style={styles.toolbar}>
      {[
        ['radius', 'location-outline', nearby ? `Até ${radius} km` : 'Distância'],
        ['category', 'list-outline', category || 'Categoria'],
        ['price', 'pricetag-outline', price ? priceLabel : 'Preço'],
        ['sort', 'swap-vertical-outline', 'Ordenar']
      ].map(([key, icon, label]) => <Pressable key={key} accessibilityRole="button" accessibilityLabel={label} onPress={() => setMenu(key)} style={key === 'sort' ? styles.sortIcon : styles.filter}>
        <Ionicons name={icon} size={key === 'sort' ? 22 : 14} color={key === 'sort' && sort !== 'recent' ? colors.primaryDarkFigo : colors.text} />
        {key !== 'sort' ? <><Text numberOfLines={1} style={styles.filterLabel}>{label}</Text><Ionicons name="chevron-down" size={11} color={colors.text} /></> : null}
      </Pressable>)}
    </View>
    <View style={styles.categories}>
      {[...categories.slice(1, 6), 'Mais'].map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => item === 'Mais' ? setMenu('category') : setCategory(category === item ? '' : item)} style={[styles.category, category === item && styles.selected]}>
        <Text style={styles.emoji}>{emojis[item] || '•••'}</Text><Text numberOfLines={1} style={styles.categoryLabel}>{item}</Text>
      </Pressable>)}
    </View>
    <View style={styles.nearby}>
      <Ionicons name="locate" size={24} color={colors.primaryDarkFigo} />
      <View style={{ flex: 1, gap: 3 }}><Text style={styles.nearbyTitle}>Produtos perto de ti</Text><Text style={styles.nearbyHelp}>{locating ? 'A obter a localização…' : 'Mostra produtos disponíveis na tua zona'}</Text></View>
      <Switch accessibilityLabel="Produtos perto de ti" value={nearby} onValueChange={onNearbyChange} disabled={locating} trackColor={{ true: colors.primaryFigo }} />
    </View>
    {active.length ? <View style={{ gap: 8 }}>
      <View style={styles.activeHeader}><Text style={styles.activeTitle}>Filtros ativos</Text><Pressable accessibilityRole="button" onPress={clear}><Text style={styles.clear}>Limpar tudo</Text></Pressable></View>
      <View style={styles.tags}>{active.map(item => <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={`Remover filtro ${item.label}`} onPress={item.remove} style={styles.tag}><Text style={styles.tagText}>{item.label}</Text><Ionicons name="close" size={14} color={colors.primaryDarkFigo} /></Pressable>)}</View>
    </View> : null}
    <Modal visible={Boolean(menu)} animationType="slide" onRequestClose={() => setMenu(null)}>
      <SafeAreaView style={styles.modal}>
        <Text style={styles.modalTitle}>{{ category: 'Categoria', price: 'Preço', sort: 'Ordenar produtos', radius: 'Distância máxima' }[menu]}</Text>
        {menu === 'price' ? <Text style={styles.nearbyHelp}>Preço anunciado por unidade de venda (kg, frasco, caixa, etc.).</Text> : null}
        <ScrollView>{options.map(item => <Pressable key={String(item.value)} accessibilityRole="radio" accessibilityState={{ checked: item.value === selected }} onPress={() => choose(item.value)} style={styles.option}><Text style={styles.optionText}>{item.label}</Text>{item.value === selected ? <Ionicons name="checkmark" size={22} color={colors.primaryDarkFigo} /> : null}</Pressable>)}</ScrollView>
        <Button title="Fechar" variant="secondary" onPress={() => setMenu(null)} />
      </SafeAreaView>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  wrapper: { gap: 16 }, toolbar: { flexDirection: 'row', gap: 4 },
  filter: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 6, minHeight: 40, flex: 1, minWidth: 0 },
  filterLabel: { fontSize: 11, color: colors.text, flexShrink: 1 },
  sortIcon: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  categories: { flexDirection: 'row', gap: 6 }, category: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, backgroundColor: colors.cream, borderRadius: 14, borderWidth: 1, borderColor: colors.cream },
  selected: { backgroundColor: colors.primaryLightFigo, borderColor: colors.primaryFigo }, emoji: { fontSize: 23 }, categoryLabel: { fontSize: 10, color: colors.text },
  nearby: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, backgroundColor: '#F1EAF5', padding: 12 }, nearbyTitle: { color: colors.primaryDarkFigo, fontSize: 14, fontWeight: '700' }, nearbyHelp: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, activeTitle: { fontWeight: '700', color: colors.text }, clear: { fontSize: 12, fontWeight: '600', color: colors.primaryDarkFigo },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, tag: { flexDirection: 'row', gap: 6, alignItems: 'center', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#F1EAF5', borderWidth: 1, borderColor: colors.primaryLightFigo }, tagText: { fontSize: 12, color: colors.primaryDarkFigo },
  modal: { flex: 1, padding: 20, gap: 16, backgroundColor: colors.background }, modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text }, option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderColor: colors.border }, optionText: { fontSize: 16, color: colors.text }
});
