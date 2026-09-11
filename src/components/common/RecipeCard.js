import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import shadows from '../../theme/shadows';

export default function RecipeCard({ recipe, onPress }) {
  const [failedImage, setFailedImage] = useState(null);
  const source = typeof recipe.image === 'string' ? { uri: recipe.image } : recipe.image;
  return <Pressable accessibilityRole="button" accessibilityLabel={recipe.title} onPress={onPress} style={styles.card}>
    {source && failedImage !== recipe.image ? <Image source={source} style={styles.image} onError={() => setFailedImage(recipe.image)} />
      : <View style={[styles.image, styles.placeholder]} accessibilityLabel="Imagem de receita indisponível"><MaterialCommunityIcons name="silverware-fork-knife" size={32} color={colors.primaryDark} /></View>}
    <View style={styles.content}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.description}>{recipe.description}</Text>
      <Text style={styles.ingredients}>{recipe.ingredients.slice(0, 3).join(' · ')}</Text>
      <View style={styles.meta}>
        <Text style={styles.detail}><MaterialCommunityIcons name="timer-outline" size={15} /> {recipe.preparationMinutes} min</Text>
        <Text style={styles.detail}>{recipe.difficulty}</Text>
        {recipe.seasonal ? <Text style={styles.badge}>Da época</Text> : null}
      </View>
    </View>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 18, overflow: 'hidden', ...shadows.card },
  image: { width: '100%', height: 104, backgroundColor: colors.primaryLight },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md, gap: spacing.sm },
  title: { color: colors.text, fontSize: typography.sizes.subtitle, fontWeight: typography.weights.bold },
  description: { color: colors.textMuted, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  ingredients: { color: colors.primaryDark, fontSize: typography.sizes.body },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md },
  detail: { color: colors.textMuted, fontSize: typography.sizes.caption },
  badge: { color: colors.primaryDark, backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
});
