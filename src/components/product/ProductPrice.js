import { StyleSheet, Text, View } from 'react-native'; 
import colors from '../../theme/colors'; 
import { formatPrice } from '../../utils/formatters';

export default function ProductPrice({ price, unit, large = false }) { 
    return <View style={styles.row}>
        <Text style={[styles.price, large && styles.large]}>
            {formatPrice(price)}
            </Text>
            <Text style={styles.unit}> 
                {unit.replace('€/', '/')}
                </Text>
                </View>
                ; 
            }

const styles = StyleSheet.create({ 
    row: { flexDirection: 'row', alignItems: 'baseline' }, 
    price: { color: colors.primaryDarkFigo, fontSize: 18, fontWeight: '800' }, 
    large: { fontSize: 26 }, unit: { color: colors.textMuted, fontSize: 13 } });
