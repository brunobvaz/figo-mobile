import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../common/Button';
import Chip from '../common/Chip';
import Input from '../common/Input';
import LocationSelect from '../common/LocationSelect';
import categories from '../../data/mockCategories';
import { DISTANCES, parsePriceRange, SORT_OPTIONS, UNITS } from '../../utils/exploreFilters';
import { locationService } from '../../services/locationService';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

const titles = { distance: 'Distância', category: 'Categoria', price: 'Preço', more: 'Mais filtros', sort: 'Ordenar produtos' };

export default function ExploreFilterSheet({ panel, filters, onClose, onApply, region, onRegionChange, onLocate, locating, producers }) {
  const [draft, setDraft] = useState(filters);
  const [minimum, setMinimum] = useState('');
  const [maximum, setMaximum] = useState('');
  const [error, setError] = useState('');
  const [municipalities, setMunicipalities] = useState([]);
  const [parishes, setParishes] = useState([]);
  useEffect(() => {
    if (!panel) return;
    setDraft({ ...filters, seasonal: Boolean(filters.season || filters.seasonal) }); setMinimum(filters.minPrice == null ? '' : String(filters.minPrice));
    setMaximum(filters.maxPrice == null ? '' : String(filters.maxPrice)); setError('');
    // Drafts are only edited inside the open sheet; applied state remains in route params.
  }, [panel]);
  useEffect(() => {
    if (panel !== 'distance') return;
    let active = true;
    locationService.municipalities().then(response => { if (active) setMunicipalities(response.items); })
      .catch(() => { if (active) setError('Não foi possível carregar as localidades. Fecha e volta a abrir para tentar novamente.'); });
    return () => { active = false; };
  }, [panel]);
  useEffect(() => {
    setParishes([]);
    if (panel !== 'distance' || !region.municipalityCode) return;
    let active = true;
    locationService.parishes(region.municipalityCode).then(response => { if (active) setParishes(response.items); })
      .catch(() => { if (active) setError('Não foi possível carregar as freguesias.'); });
    return () => { active = false; };
  }, [panel, region.municipalityCode]);
  const choose = patch => { onApply(patch); onClose(); };
  const option = (label, selected, onPress, key = label) => <Pressable key={key} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={styles.option}>
    <Text style={[styles.optionLabel, selected && styles.selected]}>{label}</Text><Text style={styles.selected}>{selected ? '✓' : ''}</Text>
  </Pressable>;
  const toggle = (key, label) => <Chip label={label} selected={Boolean(draft[key])} style={styles.chip} onPress={() => setDraft(current => ({ ...current, [key]: !current[key] }))} />;
  return <Modal transparent visible={Boolean(panel)} animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} accessibilityRole="button" accessibilityLabel="Fechar filtros" onPress={onClose} />
      <SafeAreaView edges={['bottom', 'top']} style={styles.sheet}>
        <View style={styles.header}><Text accessibilityRole="header" style={styles.title}>{titles[panel]}</Text><Pressable accessibilityRole="button" onPress={onClose} style={styles.close}><Text style={styles.selected}>Fechar</Text></Pressable></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          {panel === 'category' ? categories.map(category => option(category === 'Todos' ? 'Todas as categorias' : category,
            (filters.category || 'Todos') === category, () => choose({ category: category === 'Todos' ? undefined : category }))) : null}
          {panel === 'sort' ? SORT_OPTIONS.map(([value, label]) => option(label, (filters.sortBy || 'recent') === value, () => choose({ sortBy: value }))) : null}
          {panel === 'distance' ? <>
            {DISTANCES.map(value => option(`Até ${value} km`, filters.radiusKm === value, () => choose({ radiusKm: value })))}
            {option('Qualquer distância', filters.radiusKm == null, () => choose({ radiusKm: undefined }))}
            <Text style={styles.help}>Usa a localização para calcular distâncias. Também podes pesquisar por concelho e freguesia.</Text>
            <Button title="Usar a minha localização" loading={locating} onPress={onLocate} />
            <LocationSelect label="Concelho" placeholder="Todos os concelhos" items={municipalities} value={region.municipalityCode || ''} onChange={code => onRegionChange({ municipalityCode: code, parishCode: '' })} />
            {region.municipalityCode ? <LocationSelect label="Freguesia" placeholder="Todas as freguesias" items={parishes} value={region.parishCode || ''} onChange={code => onRegionChange({ ...region, parishCode: code })} /> : null}
          </> : null}
          {panel === 'price' ? <>
            <Text style={styles.help}>Preço anunciado por unidade de venda (kg, frasco, caixa, etc.).</Text>
            <Input label="Preço mínimo (€)" value={minimum} onChangeText={setMinimum} keyboardType="decimal-pad" placeholder="Sem mínimo" />
            <Input label="Preço máximo (€)" value={maximum} onChangeText={setMaximum} keyboardType="decimal-pad" placeholder="Sem máximo" />
            <View style={styles.chips}>{[['Até 5 €', '', '5'], ['5 € – 10 €', '5', '10'], ['10 € – 25 €', '10', '25'], ['A partir de 25 €', '25', '']].map(([label, min, max]) => <Chip key={label} label={label} style={styles.chip} onPress={() => { setMinimum(min); setMaximum(max); setError(''); }} />)}</View>
          </> : null}
          {panel === 'more' ? <>
            <View style={styles.chips}>{toggle('availableOnly', 'Apenas disponíveis')}{toggle('featured', 'Em destaque')}{toggle('seasonal', 'Da época')}</View>
            <Text style={styles.help}>Destaques: seleção temporária do Início. A informação sazonal ainda pode não estar disponível.</Text>
            <Text style={styles.label}>Unidade</Text>
            <View style={styles.chips}><Chip label="Todas" selected={!draft.unit} style={styles.chip} onPress={() => setDraft(current => ({ ...current, unit: undefined }))} />{UNITS.map(unit => <Chip key={unit} label={unit.replace('€/', '')} selected={draft.unit === unit} style={styles.chip} onPress={() => setDraft(current => ({ ...current, unit }))} />)}</View>
            <Text style={styles.label}>Vendedor / produtor</Text>
            <Text style={styles.help}>Produtores dos produtos já carregados.</Text>
            {option('Todos os produtores', !draft.sellerId, () => setDraft(current => ({ ...current, sellerId: undefined })))}
            {producers.map(producer => option(producer.name, draft.sellerId === producer.id, () => setDraft(current => ({ ...current, sellerId: producer.id })), producer.id))}
          </> : null}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        </ScrollView>
        {panel === 'price' ? <View style={styles.footer}>
          <Button title="Limpar preço" variant="secondary" onPress={() => choose({ minPrice: undefined, maxPrice: undefined })} />
          <Button title="Aplicar" onPress={() => { const value = parsePriceRange(minimum, maximum); if (value.error) setError(value.error); else choose(value); }} />
        </View> : null}
        {panel === 'more' ? <View style={styles.footer}>
          <Button title="Limpar filtros" variant="secondary" onPress={() => setDraft({})} />
          <Button title="Aplicar" onPress={() => choose({ featured: draft.featured, seasonal: draft.seasonal, season: draft.seasonal ? draft.season : undefined, availableOnly: draft.availableOnly, unit: draft.unit, sellerId: draft.sellerId })} />
        </View> : null}
      </SafeAreaView>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { maxHeight: '90%', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { color: colors.text, fontWeight: '700', fontSize: 21 }, close: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  content: { gap: spacing.sm, paddingBottom: spacing.md }, footer: { gap: 8, paddingVertical: 8 },
  option: { minHeight: 48, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  optionLabel: { color: colors.text, fontSize: 16, flexShrink: 1 }, selected: { color: colors.primaryDarkFigo, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 44, justifyContent: 'center' },
  label: { fontSize: 16, color: colors.text, fontWeight: '600', marginTop: 8 },
  help: { color: colors.textMuted, fontSize: 13, lineHeight: 19 }, error: { color: colors.error },
});
