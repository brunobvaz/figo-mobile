import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function EmptyState({ title = 'Ainda não há nada aqui', message, icon = 'leaf-outline', actionLabel, onAction }) {
  return <View style={styles.container}>
    <View accessible={false} style={styles.icon}><Ionicons name={icon} size={32} color={colors.primaryDarkFigo} /></View>
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
    {actionLabel && onAction ? <Button title={actionLabel} variant="secondary" onPress={onAction} style={styles.action} /> : null}
  </View>;
}
const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xl, paddingHorizontal: spacing.md, alignItems: 'center', gap: spacing.sm, width: '100%', maxWidth: 480, alignSelf: 'center' },
  icon: { width: 64, height: 64, borderRadius: 22, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  message: { color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  action: { marginTop: spacing.md, alignSelf: 'stretch' }
});
