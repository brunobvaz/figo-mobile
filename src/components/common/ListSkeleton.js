import { StyleSheet, View } from 'react-native';
import colors from '../../theme/colors';

// Static placeholders retain layout without motion or repeated announcements.
export default function ListSkeleton({ rows = 3, product = false, label = 'A carregar…' }) {
  return <View accessible accessibilityLabel={label} accessibilityState={{ busy: true }} style={styles.list}>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.list}>
      {Array.from({ length: rows }, (_, index) => <View key={index} style={styles.card}>
        <View style={[styles.block, product ? styles.photo : styles.avatar]} />
        <View style={styles.copy}>
          <View style={[styles.block, styles.title]} />
          <View style={[styles.block, styles.line]} />
          <View style={[styles.block, styles.short]} />
        </View>
      </View>)}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  list: { gap: 16, width: '100%' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle },
  block: { backgroundColor: colors.skeleton, borderRadius: 6 },
  photo: { width: 100, height: 100, borderRadius: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  copy: { flex: 1, gap: 12 }, title: { height: 18, width: '75%' }, line: { height: 14, width: '90%' }, short: { height: 14, width: '50%' }
});
