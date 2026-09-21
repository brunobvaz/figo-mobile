import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/layout/Screen';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import EmptyState from '../../components/common/EmptyState';
import RecipePhoto from '../../components/common/RecipePhoto';
import RecipeMeta from '../../components/common/RecipeMeta';
import useRecipe from '../../hooks/useRecipe';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import { CONTENT_MAX_WIDTH } from '../../theme/layout';

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipe, busy, error, notFound, retry } = useRecipe(route.params?.recipeId);
  if (busy) return <Screen contentContainerStyle={styles.centered}>
    <LoadingIndicator accessibilityLabel="A carregar receita" color={colors.primaryFigo} />
  </Screen>;
  if (!recipe) return <Screen contentContainerStyle={styles.centered}>
    <EmptyState title={notFound ? 'Receita indisponível' : 'Não foi possível carregar a receita'} message={error}
      actionLabel={notFound ? 'Voltar às receitas' : 'Tentar novamente'} onAction={notFound ? () => navigation.goBack() : retry} />
  </Screen>;
  return <Screen scroll maxWidth="100%" contentContainerStyle={styles.page}>
    <RecipePhoto image={recipe.image} title={recipe.title} style={styles.hero} />
    <View style={styles.content}>
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={styles.title}>{recipe.title}</Text>
        <RecipeMeta recipe={recipe} />
        <View style={styles.categories}>
          {recipe.categories.map(category => <Text key={category} style={styles.category}>{category}</Text>)}
        </View>
        <Text style={styles.description}>{recipe.description}</Text>
      </View>
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.heading}>Ingredientes</Text>
        {recipe.ingredients.map((ingredient, index) => <View key={index} style={styles.ingredient}>
          <View accessible={false} style={styles.bullet} />
          <Text style={styles.body}>{ingredient}</Text>
        </View>)}
      </View>
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.heading}>Modo de preparação</Text>
        {recipe.steps.length ? recipe.steps.map((step, index) => <View key={index} style={styles.step}>
          <View style={styles.stepNumber}><Text style={styles.number}>{index + 1}</Text></View>
          <Text style={styles.body}>{step}</Text>
        </View>) : <Text style={styles.description}>O modo de preparação ainda não foi adicionado.</Text>}
      </View>
    </View>
  </Screen>;
}
const styles = StyleSheet.create({
  centered: { justifyContent: 'center' },
  page: { paddingHorizontal: 0, gap: spacing.lg },
  hero: { aspectRatio: 1.5 },
  content: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', paddingHorizontal: spacing.md, gap: spacing.lg },
  intro: { gap: spacing.md },
  title: { color: colors.text, fontSize: typography.sizes.screenTitle, fontWeight: typography.weights.bold },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  category: { color: colors.primaryDarkFigo, backgroundColor: colors.surfaceSoft, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: 8, fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
  description: { color: colors.textMuted, fontSize: typography.sizes.body, lineHeight: 25 },
  section: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.surface, borderRadius: 18 },
  heading: { color: colors.text, fontSize: typography.sizes.sectionTitle, fontWeight: typography.weights.bold },
  ingredient: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 9, backgroundColor: colors.primaryFigo },
  body: { flex: 1, color: colors.text, fontSize: typography.sizes.body, lineHeight: 25 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  stepNumber: { minWidth: 30, minHeight: 30, padding: spacing.xs, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSoft },
  number: { color: colors.primaryDarkFigo, fontSize: typography.sizes.body, fontWeight: typography.weights.bold }
});
