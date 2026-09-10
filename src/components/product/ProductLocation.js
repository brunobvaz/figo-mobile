import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import AddressSelect from '../common/AddressSelect';
import { applyProductAddress } from '../../utils/productLocation';
import Input from '../common/Input';
import ProductFieldHeading from './ProductFieldHeading';
import { validateProductLocation } from '../../utils/validators';
export default function ProductLocation({ form, setForm, errors }) {
  const [addressOpen, setAddressOpen] = useState(false);
  const locationDefined = form.locationChanged === false || (form.parishCode
    && Number.isFinite(form.latitude) && Number.isFinite(form.longitude));
  const locationError = errors.location ? validateProductLocation(form) : '';
  const change = (patch, parish) => {
    if (Object.entries(patch).every(([key, value]) => form[key] === value)) return;
    setForm(current => applyProductAddress(current, patch, parish));
  };
  return <View style={{ gap: 10 }}>
    <AddressSelect municipalityCode={form.municipalityCode} parishCode={form.parishCode} onChange={change} open={addressOpen} onOpenChange={setAddressOpen} />
    <ProductFieldHeading title="Localidade" subtitle="Indica a aldeia, o lugar ou a zona dentro da freguesia." />
    <Input accessibilityLabel="Localidade" value={form.locality || ''} onChangeText={locality => change({ locality })} error={errors.locality} />
    {locationDefined ? <View style={styles.success} accessibilityLiveRegion="polite">
      <Ionicons name="checkmark-circle" size={34} color="#278438" />
      <View style={styles.statusCopy}>
        <Text style={styles.successTitle}>{form.locationSource === 'parish' ? 'Localização aproximada' : 'Localização definida.'}</Text>
        <Text style={styles.statusDescription}>{form.locationSource === 'parish' ? 'Preenchida automaticamente a partir da freguesia.' : 'Confirma que corresponde ao local do produto.'}</Text>
      </View>
    </View> : <Text style={styles.statusDescription}>Seleciona o concelho e a freguesia para preencher a localização aproximada.</Text>}
    {locationError ? <Text style={{ color: '#b00020' }}>{locationError}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  success: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 16, minHeight: 80, borderRadius: 14, borderWidth: 1, borderColor: '#B7DFC3', backgroundColor: '#EDF7F1' },
  statusCopy: { flex: 1, gap: 5 },
  successTitle: { fontSize: 16, fontWeight: '700', color: '#206C30' },
  statusDescription: { fontSize: 14, lineHeight: 20, color: '#697584' },
});
