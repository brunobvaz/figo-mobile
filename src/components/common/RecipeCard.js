import { Pressable, StyleSheet, Text, View } from 'react-native';
import RecipePhoto from './RecipePhoto';
import RecipeMeta from './RecipeMeta';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import shadows from '../../theme/shadows';

export default function RecipeCard({ recipe, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${recipe.title}, ${recipe.preparationMinutes} minutos, ${recipe.difficulty}${recipe.seasonal ? ', da época' : ''}`}
    accessibilityHint="Abre os ingredientes e o modo de preparação" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
    <RecipePhoto image={recipe.image} title={recipe.title} style={styles.image} />
    <View style={styles.content}>
      <Text numberOfLines={2} style={styles.title}>{recipe.title}</Text>
      <RecipeMeta recipe={recipe} />
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 18, overflow: 'hidden', ...shadows.card },
  pressed: { opacity: 0.85 },
  image: { height: 148 },
  content: { padding: spacing.md, gap: spacing.sm },
  title: { color: colors.text, fontSize: typography.sizes.subtitle, fontWeight: typography.weights.bold },
});
