import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/layout/Screen';
import { legalDocuments } from '../../data/legalDocuments';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function LegalDocumentScreen({ route }) {
  const document = legalDocuments[route.params?.document] || legalDocuments.terms;
  return <Screen scroll safeAreaEdges={['bottom']} contentContainerStyle={styles.page}>
    <Text accessibilityRole="header" style={styles.title}>{document.title}</Text>
    {document.updatedAt ? <Text style={styles.meta}>Última atualização: {document.updatedAt}</Text> : null}
    {document.sections.length ? document.sections.map((section, index) => <View key={index} style={styles.section}>
      <Text accessibilityRole="header" style={styles.heading}>{section.title}</Text>
      <Text selectable style={styles.body}>{section.text}</Text>
    </View>) : <Text style={styles.body}>Este documento ainda não está disponível. Volta a consultar esta página mais tarde.</Text>}
  </Screen>;
}
const styles = StyleSheet.create({
  page: { paddingTop: spacing.lg, gap: spacing.lg },
  title: { fontSize: typography.sizes.title, fontWeight: '700', color: colors.text },
  meta: { fontSize: typography.sizes.caption, color: colors.textMuted },
  section: { gap: spacing.sm },
  heading: { fontSize: typography.sizes.subtitle, fontWeight: '600', color: colors.text },
  body: { fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body, color: colors.text },
});
