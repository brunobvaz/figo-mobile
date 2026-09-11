import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../navigation/routes';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

const cards = [
  { route: ROUTES.SEASONAL_RECIPES, title: 'Receitas da época', description: 'Ideias para cozinhar com produtos locais', icon: 'chef-hat', background: '#F0E7F5', accent: '#714192', text: '#342440' },
  { route: ROUTES.FAIRS_EVENTS, title: 'Feiras e eventos', description: 'Descobre o que vai acontecer na tua região', icon: 'calendar-month', background: '#FCECDD', accent: '#AC4935', text: '#512C20' },
];

export default function HomeDiscover() {
  const navigation = useNavigation();
  const [width, setWidth] = useState(0);
  const cardWidth = Math.max(200, (width - 12) / 2);

  return <View style={styles.section} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <View style={styles.header}>
      <Text accessibilityRole="header" style={styles.heading}>Mais do que produtos</Text>

    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
      {cards.map(card => <Pressable accessibilityRole="button" onPress={() => navigation.navigate(card.route)} key={card.title} style={[styles.card, { width: cardWidth, backgroundColor: card.background }]}>
        <MaterialCommunityIcons name={card.icon} size={34} color={card.accent} />
        <View style={styles.cardBody}>
          <View style={styles.copy}>
            <Text style={[styles.cardTitle, { color: card.text }]}>{card.title}</Text>
            <Text style={[styles.description, { color: card.text }]}>{card.description}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={23} color={card.accent} />
        </View>
      </Pressable>)}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: 12, marginTop: spacing.sm, marginBottom: spacing.sm },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  heading: { fontSize: 21, fontWeight: '700', color: colors.text },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewAllText: { color: '#25824B', fontSize: 14, fontWeight: '600' },
  cards: { gap: 12 },
  card: { borderRadius: 16, padding: 16, gap: 8, minHeight: 136 },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  copy: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 19 },
});
