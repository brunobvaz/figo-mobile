import { useState } from 'react';
import { Modal, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Input from './Input';
import Button from './Button';
import colors from '../../theme/colors';
const displayName = item => item ? `${item.name}${item.region ? ` · ${item.region}` : ''}` : '';
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export default function LocationSelect({ label, items, value, onChange, disabled = false, placeholder = 'Selecionar' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const choose = code => { onChange(code); setOpen(false); };
  return <View style={{ gap: 6 }}>
    <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
    <Button variant="secondary" disabled={disabled} title={displayName(items.find(x => x.code === value)) || placeholder} onPress={() => { setQuery(''); setOpen(true); }} />
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      {/* Native modals need their own provider to measure the presented window's insets. */}
      <SafeAreaProvider>
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={{ flex: 1, padding: 20, gap: 12, backgroundColor: colors.background }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>{label}</Text>
        <Input placeholder="Pesquisar pelo nome" value={query} onChangeText={setQuery} />
        <Button variant="secondary" title={placeholder} onPress={() => choose('')} />
        <FlatList keyboardShouldPersistTaps="handled" data={items.filter(x => normalize(displayName(x)).includes(normalize(query)))} keyExtractor={x => x.code} renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => choose(item.code)} style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#ddd' }}><Text style={{ color: colors.text }}>{displayName(item)}</Text></Pressable>} ListEmptyComponent={<Text>Sem resultados.</Text>} />
        <Button title="Fechar" onPress={() => setOpen(false)} />
      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  </View>;
}
