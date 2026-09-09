import { StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors';
import { formatPrice } from '../../utils/formatters';
import { parsePrice } from '../../utils/price';

export default function ProductPrice({ price, unit, large = false }) {
  const amount = parsePrice(price);
  const formatted = Number.isFinite(amount) ? formatPrice(amount) : 'Preço indisponível';
  const unitLabel = unit?.replace(/^€\s*\/\s*/, '');

  return <Text selectable={false} style={[styles.price, large && styles.large]}>
    {formatted}
    {Number.isFinite(amount) && unitLabel ? <Text style={[styles.unit, large && styles.largeUnit]}> / {unitLabel}</Text> : null}
  </Text>;
}

const styles = StyleSheet.create({
  price: { color: colors.primaryDarkFigo, fontSize: 20, fontWeight: '800' },
  large: { fontSize: 32 },
  unit: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  largeUnit: { fontSize: 18 },
});
