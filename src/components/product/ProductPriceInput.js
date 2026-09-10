import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../common/Button';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import ProductFieldHeading from './ProductFieldHeading';
import { PRODUCT_UNITS } from '../../utils/constants';
import { formatPriceInput } from '../../utils/price';

export default function ProductPriceInput({ price, unit, onPriceChange, onUnitChange, error }) {
  const [open, setOpen] = useState(false);
  return <View style={styles.wrapper}>
    <ProductFieldHeading title="Preço" subtitle="Define o preço e a unidade do produto." />
    <View style={[styles.field, error && { borderColor: colors.error }]}>
      <TextInput
        accessibilityLabel="Preço do produto"
        value={price}
        onChangeText={onPriceChange}
        onBlur={() => onPriceChange(formatPriceInput(price))}
        keyboardType="decimal-pad"
        placeholder="0,00"
        placeholderTextColor={colors.textMuted}
        style={styles.price}
      />
      <View style={styles.divider} />
      <Pressable accessibilityRole="button" accessibilityLabel={`Unidade: ${unit}. Alterar unidade`} onPress={() => setOpen(true)} style={styles.unit}>
        <Text style={styles.unitValue}>{unit}</Text>
        <Ionicons name="chevron-down" size={18} color="#505B70" />
      </Pressable>
    </View>
    {error ? <Text style={{ color: colors.error }}>{error}</Text> : null}
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={styles.modal}>
        <Text style={styles.label}>Unidade do produto</Text>
        {PRODUCT_UNITS.map(item => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: item === unit }} onPress={() => { onUnitChange(item); setOpen(false); }} style={styles.option}>
          <Text style={styles.value}>{item}</Text>
          {item === unit ? <Ionicons name="checkmark" size={24} color={colors.primaryDarkFigo} /> : null}
        </Pressable>)}
        <Button title="Cancelar" variant="secondary" onPress={() => setOpen(false)} />
      </SafeAreaView>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  label: { fontSize: 18, fontWeight: '700', color: '#1E2942' },
  field: { flexDirection: 'row', alignItems: 'center', minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  price: { flex: 1.2, minWidth: 0, minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: 0, fontSize: 14, color: colors.text },
  divider: { width: 1, height: 26, backgroundColor: '#E8E9EF' },
  unit: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: 8 },
  unitValue: { fontSize: 14, color: colors.text, flexShrink: 1 },
  value: { fontSize: 18, fontWeight: '600', color: '#1E2942', flexShrink: 1 },
  modal: { flex: 1, padding: 20, gap: 14, backgroundColor: colors.background },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
});
