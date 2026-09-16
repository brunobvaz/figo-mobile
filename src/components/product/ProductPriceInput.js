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

export default function ProductPriceInput({ price, unit, onPriceChange, onUnitChange, error, disabled = false, hideHeading = false }) {
  const [open, setOpen] = useState(false);
  return <View style={styles.wrapper}>
    {!hideHeading ? <ProductFieldHeading title="Preço" subtitle="Define o preço e a unidade do produto." /> : <Text style={styles.helper}>Define o preço e a unidade de venda.</Text>}
    <View style={[styles.field, error && { borderColor: colors.error }]}>
      <TextInput
        accessibilityLabel="Preço do produto"
        editable={!disabled}
        value={price}
        onChangeText={onPriceChange}
        onBlur={() => onPriceChange(formatPriceInput(price))}
        keyboardType="decimal-pad"
        placeholder="0,00"
        placeholderTextColor={colors.textMuted}
        style={styles.price}
      />
      <View style={styles.divider} />
      <Pressable disabled={disabled} accessibilityState={{ disabled }} accessibilityRole="button" accessibilityLabel={`Unidade: ${unit}. Alterar unidade`} onPress={() => setOpen(true)} style={styles.unit}>
        <Text style={styles.unitValue}>{unit}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
    {error ? <Text accessibilityRole="alert" style={{ color: colors.error, fontSize: 13 }}>{error}</Text> : null}
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
  helper: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  label: { fontSize: 18, fontWeight: '700', color: colors.text },
  field: { flexDirection: 'row', alignItems: 'center', minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  price: { flex: 1.2, minWidth: 0, minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 16, color: colors.text },
  divider: { width: 1, height: 26, backgroundColor: '#E8E9EF' },
  unit: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: 8 },
  unitValue: { fontSize: 16, color: colors.text, flexShrink: 1 },
  value: { fontSize: 18, fontWeight: '600', color: colors.text, flexShrink: 1 },
  modal: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center', padding: 20, gap: 14, backgroundColor: colors.background },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
});
