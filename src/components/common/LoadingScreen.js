import { Modal, StyleSheet, Text, View } from 'react-native';
import LoadingIndicator from './LoadingIndicator';
import useDelayedLoading from '../../hooks/useDelayedLoading';
import colors from '../../theme/colors';
import typography from '../../theme/typography';

// Optional children stay mounted underneath the page-level loading overlay.
export default function LoadingScreen({ message = 'A carregar…', loading = true, children, blocking = true }) {
  const visible = useDelayedLoading(loading);
  const overlay = <View pointerEvents={blocking ? 'auto' : 'none'} style={styles.overlay} accessibilityViewIsModal={blocking}>
    <View style={styles.backdrop} />
    <View style={styles.center}>
      <View style={styles.icon}>
        <LoadingIndicator size="large" delay={0} accessibilityLabel={message || 'A carregar'} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  </View>;
  if (!blocking) return <View style={styles.container}>
    {children}
    {visible ? overlay : null}
  </View>;
  return <>
    {children || <View style={styles.page} />}
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent navigationBarTranslucent presentationStyle="overFullScreen" onRequestClose={() => {}}>
      {overlay}
    </Modal>
  </>;

}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, position: 'relative', minHeight: 0 },
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.background, opacity: 0.7 },
  // Centre the icon itself; the message never moves it above the midpoint.
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  message: { position: 'absolute', top: 48, width: 280, alignSelf: 'center', textAlign: 'center', color: colors.textMuted, fontSize: typography.sizes.body },
});
