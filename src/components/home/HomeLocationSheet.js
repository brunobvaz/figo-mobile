import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../common/Button';
import { useActiveLocation } from '../../context/ActiveLocationContext';
import { locationLabel } from '../../utils/activeLocation';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function HomeLocationSheet({ visible, onClose }) {
  const { locationSource, profileLocation, locating, selectDevice, selectProfile } = useActiveLocation();
  const chooseDevice = () => { onClose(); selectDevice(); };
  const chooseProfile = () => { selectProfile(); onClose(); };
  return <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} accessibilityRole="button" accessibilityLabel="Fechar seleção de localização" onPress={onClose} />
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.sheet}>
        <Text accessibilityRole="header" style={styles.title}>Usar localização</Text>
        {[
          ['device', 'Localização atual', 'Usar a localização deste dispositivo', chooseDevice],
          ['profile', 'Localização do perfil', locationLabel(profileLocation), chooseProfile],
        ].map(([source, title, description, onPress]) => <Pressable key={source} accessibilityRole="radio"
          accessibilityState={{ checked: locationSource === source }} onPress={onPress} style={styles.option}>
          <View style={styles.copy}><Text style={styles.label}>{title}</Text><Text style={styles.description}>{description}</Text></View>
          <Text style={styles.selected}>{locationSource === source ? '✓' : ''}</Text>
        </Pressable>)}
        {locating ? <Text style={styles.description}>A obter localização…</Text> : null}
        <Button title="Fechar" variant="secondary" onPress={onClose} />
      </SafeAreaView>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 72, paddingVertical: spacing.sm },
  copy: { flex: 1, gap: spacing.xs },
  label: { fontSize: 16, fontWeight: '600', color: colors.text },
  description: { fontSize: 14, color: colors.textMuted },
  selected: { color: colors.primaryDarkFigo, fontSize: 22 },
});
