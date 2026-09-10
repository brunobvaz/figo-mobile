import { StyleSheet, Text, View } from 'react-native';

export default function ProductFieldHeading({ title, subtitle }) {
  return <View style={styles.heading}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>;
}

const styles = StyleSheet.create({
  heading: { gap: 6 },
  title: { fontSize: 18, fontWeight: '700', color: '#1E2942' },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#80889D' }
});
