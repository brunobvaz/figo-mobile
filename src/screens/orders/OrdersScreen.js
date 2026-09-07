import { StyleSheet, Text, View } from 'react-native';
import Header from '../../components/layout/Header';
import Screen from '../../components/layout/Screen';
import { mockOrders } from '../../services/orderService';
import colors from '../../theme/colors';
import shadows from '../../theme/shadows';
import spacing from '../../theme/spacing';
import { formatPrice } from '../../utils/formatters';

const labels = {
    pending: 'Pendente',
    accepted: 'Aceite',
    ready: 'Pronto a levantar',
    completed: 'Concluído',
    cancelled: 'Cancelado'
};

export default function OrdersScreen() {
    return <Screen scroll>
        <Header
            title="Encomendas"
            subtitle="Estrutura demonstrativa"
        />{
            mockOrders.map((order) =>
                <View
                    key={order.id}
                    style={styles.card}
                >
                    <View style={styles.row}>
                        <Text style={styles.title}>
                            {order.products[0].title}
                        </Text>
                        <Text style={styles.status}>{labels[order.status]}
                        </Text>
                    </View>
                    <Text style={styles.meta}>{order.seller} · {order.quantity} unidade(s)</Text>
                    <Text style={styles.price}>{formatPrice(order.price)}</Text>
                </View>)
        }
    </Screen>;
}

const styles = StyleSheet.create({
    card: { marginBottom: spacing.md, padding: spacing.md, borderRadius: 16, backgroundColor: colors.surface, gap: spacing.sm, ...shadows.card },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
    title: { flex: 1, color: colors.text, fontWeight: '700', fontSize: 16 },
    status: { color: colors.primaryDarkFigo, backgroundColor: colors.primaryLightFigo, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, fontSize: 11 },
    meta: { color: colors.textMuted }, price: { color: colors.primaryDarkFigo, fontWeight: '800' }
});
