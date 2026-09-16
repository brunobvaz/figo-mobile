import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../navigation/routes';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

const cards = [
  { route: ROUTES.SEASONAL_RECIPES, title: 'Receitas da época', description: 'Ideias para cozinhar com produtos locais', icon: 'chef-hat', background: '#F0E7F5', accent: '#714192', text: '#342440' },
  { route: ROUTES.FAIRS_EVENTS, title: 'Feiras e eventos', description: 'Descobre o que vai acontecer na tua região', icon: 'calendar-month', background: '#FCECDD', accent: '#AC4935', text: '#512C20' },
];

export default function HomeDiscover() {
  const navigation = useNavigation();
  const { width, fontScale } = useWindowDimensions();
  return <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.heading}>Mais do que produtos</Text>
    <View style={[styles.cards, (width < 360 || fontScale > 1.3) && { flexDirection: 'column' }]}>
      {cards.map(card => <Pressable accessibilityRole="button" onPress={() => navigation.navigate(card.route)} key={card.title} style={[styles.card, { backgroundColor: card.background }]}>
        <MaterialCommunityIcons accessible={false} name={card.icon} size={34} color={card.accent} />
        <View style={styles.cardBody}>
          <View style={styles.copy}>
            <Text style={[styles.cardTitle, { color: card.text }]}>{card.title}</Text>
            <Text style={[styles.description, { color: card.text }]}>{card.description}</Text>
          </View>
          <MaterialCommunityIcons accessible={false} name="chevron-right" size={26} color={card.accent} />
        </View>
      </Pressable>)}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: 12, marginTop: spacing.sm, marginBottom: spacing.sm },
  heading: { fontSize: 21, fontWeight: '700', color: colors.text },
  cards: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  card: { flex: 1, minWidth: 0, minHeight: 184, borderRadius: 20, padding: 12, gap: 10 },
  cardBody: { flex: 1, gap: 8, justifyContent: 'space-between', alignItems: 'flex-start' },
  copy: { alignSelf: 'stretch', gap: 3 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  description: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
});
