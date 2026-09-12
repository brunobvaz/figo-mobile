import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../navigation/routes';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

const cards = [
  { route: ROUTES.SEASONAL_RECIPES, title: 'Receitas da época', description: 'Ideias para cozinhar com produtos locais', icon: 'chef-hat', background: '#F0E7F5', accent: '#714192', text: '#342440' },
  { route: ROUTES.FAIRS_EVENTS, title: 'Feiras e eventos', description: 'Descobre o que vai acontecer na tua região', icon: 'calendar-month', background: '#FCECDD', accent: '#AC4935', text: '#512C20' },
];

export default function HomeDiscover() {
  const navigation = useNavigation();
  return <View style={styles.section}>
    <View style={styles.header}>
      <Text accessibilityRole="header" style={styles.heading}>Mais do que produtos</Text>

    </View>
    <View style={styles.cards}>
      {cards.map(card => <Pressable accessibilityRole="button" onPress={() => navigation.navigate(card.route)} key={card.title} style={[styles.card, { backgroundColor: card.background }]}>
        <MaterialCommunityIcons name={card.icon} size={34} color={card.accent} />
        <View style={styles.cardBody}>
          <View style={styles.copy}>
            <Text style={[styles.cardTitle, { color: card.text }]}>{card.title}</Text>
            <Text style={[styles.description, { color: card.text }]}>{card.description}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={23} color={card.accent} />
        </View>
      </Pressable>)}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: 12, marginTop: spacing.sm, marginBottom: spacing.sm },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  heading: { fontSize: 21, fontWeight: '700', color: colors.text },
  cards: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  card: { flex: 1, minWidth: 0, borderRadius: 16, padding: 12, gap: 8, minHeight: 136 },
  cardBody: { flex: 1, gap: 8, justifyContent: 'space-between', alignItems: 'flex-start' },
  copy: { alignSelf: 'stretch', gap: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  description: { fontSize: 13, lineHeight: 18 },
});
