import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Button from './Button';
import Input from './Input';
import colors from '../../theme/colors';
import { locationService } from '../../services/locationService';

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function AddressSelect({ municipalityCode, parishCode, onChange, open: controlledOpen, onOpenChange }) {
  const [municipalities, setMunicipalities] = useState([]);
  const [savedParishes, setSavedParishes] = useState([]);
  const [items, setItems] = useState([]);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (open) { setSelectedMunicipality(null); setQuery(''); }
  }, [open]);

  useEffect(() => {
    let active = true;
    locationService.municipalities().then(result => {
      if (active) setMunicipalities(result.items);
    }).catch(() => {});
    return () => { active = false; };
  }, [retry, open]);

  useEffect(() => {
    let active = true;
    setSavedParishes([]);
    if (municipalityCode) locationService.parishes(municipalityCode).then(result => {
      if (active) setSavedParishes(result.items);
    }).catch(() => {});
    return () => { active = false; };
  }, [municipalityCode, retry, open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setBusy(true);
    setError('');
    setItems([]);
    const request = selectedMunicipality
      ? locationService.parishes(selectedMunicipality.code)
      : locationService.municipalities();
    request.then(result => {
      if (active) setItems(result.items);
    }).catch(e => {
      if (active) setError(e.message || 'Não foi possível carregar os locais.');
    }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [open, selectedMunicipality, retry]);

  const municipality = municipalities.find(item => item.code === municipalityCode);
  const parish = savedParishes.find(item => item.code === parishCode);
  const title = parish && municipality ? `${parish.name}, ${municipality.name}`
    : municipality?.name || (municipalityCode ? 'Localização selecionada' : 'Selecionar localização');
  const subtitle = municipality
    ? [parish?.name, municipality.name, 'Portugal'].filter(Boolean).join(' · ')
    : 'Escolhe o concelho e a freguesia';

  const choose = item => {
    if (!selectedMunicipality) {
      setSelectedMunicipality(item);
      setQuery('');
      return;
    }
    setMunicipalities(current => current.some(value => value.code === selectedMunicipality.code)
      ? current : [...current, selectedMunicipality]);
    setSavedParishes(items);
    onChange({ municipalityCode: selectedMunicipality.code, parishCode: item.code }, item);
    setOpen(false);
  };

  return <>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Localização: ${title}. Selecionar concelho e freguesia`}
      onPress={() => { setSelectedMunicipality(null); setQuery(''); setOpen(true); }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}
    >
      <Ionicons name="location" size={36} color={colors.primaryDarkFigo} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#505B70" />
    </Pressable>
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      {/* Native modals need their own provider to measure the presented window's insets. */}
      <SafeAreaProvider>
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.modal}>
        <Text accessibilityRole="header" style={styles.heading}>
          {selectedMunicipality ? 'Selecionar freguesia' : 'Selecionar concelho'}
        </Text>
        {selectedMunicipality ? <>
          <Text style={styles.subtitle}>{selectedMunicipality.name}</Text>
          <Button title="Alterar concelho" variant="soft" onPress={() => { setSelectedMunicipality(null); setQuery(''); }} />
        </> : null}
        <Input placeholder={selectedMunicipality ? 'Pesquisar freguesia' : 'Pesquisar concelho'} value={query} onChangeText={setQuery} />
        {busy ? <ActivityIndicator color={colors.primaryDarkFigo} /> : error ? <>
          <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text>
          <Button title="Tentar novamente" onPress={() => setRetry(value => value + 1)} />
        </> : <FlatList
          data={items.filter(item => normalize(`${item.name} ${item.region || ''}`).includes(normalize(query)))}
          keyboardShouldPersistTaps="handled"
          keyExtractor={item => item.code}
          renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => choose(item)} style={styles.item}>
            <Text style={styles.title}>{item.name}</Text>
            {item.region ? <Text style={styles.subtitle}>{item.region}</Text> : null}
          </Pressable>}
          ListEmptyComponent={<Text>Sem resultados.</Text>}
        />}
        <Button title="Cancelar" variant="secondary" onPress={() => setOpen(false)} />
      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 82, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#DFE1E8', backgroundColor: colors.surface },
  copy: { flex: 1, gap: 4 },
  title: { fontSize: 18, fontWeight: '600', color: '#1E2942' },
  subtitle: { fontSize: 14, color: '#80889D' },
  modal: { flex: 1, padding: 20, gap: 14, backgroundColor: colors.background },
  heading: { fontSize: 22, fontWeight: '700', color: colors.text },
  item: { paddingVertical: 16, gap: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
});
