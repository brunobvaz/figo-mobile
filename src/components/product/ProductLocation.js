import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import AddressSelect from '../common/AddressSelect';
import LocationMap from './LocationMap';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateProductLocation } from '../../utils/validators';
import { locationService } from '../../services/locationService';
export default function ProductLocation({ form, setForm, errors }) {
  const [addressOpen, setAddressOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const revision = useRef(0);
  const [mapOpen, setMapOpen] = useState(false);
  const [point, setPoint] = useState(null);
  const locationDefined = !validateProductLocation(form);
  const locationError = errors.location ? validateProductLocation(form) : '';
  const change = patch => { if (Object.entries(patch).every(([key, value]) => form[key] === value)) return; revision.current++; setForm(current => ({ ...current, ...patch, latitude: '', longitude: '', locationChanged: true })); };
  const capture = async () => {
    const started = revision.current;
    setBusy(true);
    try {
      const coords = await locationService.current();
      if (revision.current !== started) return;
      Alert.alert('Confirmar local', 'O produto está no local onde te encontras?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Confirmar', onPress: () => { if (revision.current === started) setForm(current => ({ ...current, ...coords, locationSource: 'gps', locationChanged: true })); } }]);
    } catch (e) { Alert.alert('Localização', e.message); }
    finally { setBusy(false); }
  };
  return <View style={{ gap: 10 }}>
    <AddressSelect municipalityCode={form.municipalityCode} parishCode={form.parishCode} onChange={change} open={addressOpen} onOpenChange={setAddressOpen} />
    <Input label="Localidade" value={form.locality || ''} onChangeText={locality => change({ locality })} error={errors.locality} />
    <View style={styles.actions}>
      <Button variant="soft" icon="navigate" title={'Usar a minha\nlocalização'} onPress={capture} loading={busy} style={styles.action} />
      {Platform.OS !== 'web' ? <Button variant="soft" icon="map-outline" title={'Escolher\nno mapa'} style={styles.action} onPress={() => { revision.current++; setPoint(form.latitude !== '' && form.latitude != null && form.longitude !== '' && form.longitude != null ? { latitude: Number(form.latitude), longitude: Number(form.longitude) } : null); setMapOpen(true); }} /> : null}
    </View>
    <Modal visible={mapOpen} animationType="slide" onRequestClose={() => setMapOpen(false)}>
      <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text>Toca no mapa para marcar o local do produto. Podes arrastar o marcador.</Text>
        {mapOpen ? <LocationMap point={point} onChange={setPoint} /> : null}
        <Button title="Confirmar local do produto" disabled={!point} onPress={() => { revision.current++; setForm(c => ({ ...c, ...point, locationSource: 'manual', locationChanged: true })); setMapOpen(false); }} />
        <Button variant="secondary" title="Cancelar" onPress={() => setMapOpen(false)} />
      </SafeAreaView>
    </Modal>
    {locationDefined ? <View style={styles.success} accessibilityLiveRegion="polite">
      <Ionicons name="checkmark-circle" size={34} color="#278438" />
      <View style={styles.statusCopy}>
        <Text style={styles.successTitle}>Localização definida.</Text>
        <Text style={styles.statusDescription}>Confirma que corresponde ao local do produto.</Text>
      </View>
    </View> : <Text style={styles.statusDescription}>Depois de preencher a morada, confirma o ponto do produto por GPS ou no mapa. Alterar a morada exige confirmar o ponto novamente.</Text>}
    {locationError ? <Text style={{ color: '#b00020' }}>{locationError}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { flexGrow: 1, flexBasis: 150, paddingHorizontal: 14, gap: 12 },
  success: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 16, minHeight: 80, borderRadius: 14, borderWidth: 1, borderColor: '#B7DFC3', backgroundColor: '#EDF7F1' },
  statusCopy: { flex: 1, gap: 5 },
  successTitle: { fontSize: 16, fontWeight: '700', color: '#206C30' },
  statusDescription: { fontSize: 14, lineHeight: 20, color: '#697584' },
});
