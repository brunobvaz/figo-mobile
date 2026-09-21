import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function RecipeMeta({ recipe }) {
  return <View style={styles.row}>
    <View style={styles.item}>
      <MaterialCommunityIcons accessible={false} name="timer-outline" size={16} color={colors.textMuted} />
      <Text style={styles.text}>{recipe.preparationMinutes} min</Text>
    </View>
    <View style={styles.item}>
      <MaterialCommunityIcons accessible={false} name="chef-hat" size={16} color={colors.textMuted} />
      <Text style={styles.text}>{recipe.difficulty}</Text>
    </View>
    {recipe.seasonal ? <View style={[styles.item, styles.seasonal]}>
      <MaterialCommunityIcons accessible={false} name="leaf" size={14} color={colors.primaryDark} />
      <Text style={[styles.text, styles.seasonalText]}>Da época</Text>
    </View> : null}
  </View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: 5, paddingHorizontal: spacing.sm, borderRadius: 8, backgroundColor: colors.background },
  text: { color: colors.textMuted, fontSize: typography.sizes.caption },
  seasonal: { backgroundColor: colors.primaryLight },
  seasonalText: { color: colors.primaryDark, fontWeight: typography.weights.semibold }
});
