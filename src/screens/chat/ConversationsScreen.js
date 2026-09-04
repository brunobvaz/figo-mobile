import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Header from '../../components/layout/Header';
import Screen from '../../components/layout/Screen';
import mockConversations from '../../data/mockConversations';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import shadows from '../../theme/shadows';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function ConversationsScreen({ navigation }) {
    const openConversation = (conversation) => navigation.navigate(ROUTES.CHAT, {
        conversationId: conversation.id,
        sellerId: conversation.seller.id,
        sellerName: conversation.seller.name,
        productId: conversation.productId,
        productTitle: conversation.productTitle,
        initialMessages: conversation.messages
    });

    return <Screen contentContainerStyle={styles.page}>
        <Header title="Conversas" subtitle="Fala diretamente com os produtores" />
        <FlatList
            data={mockConversations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <EmptyState
                    title="Ainda não tens conversas"
                    message="Contacta um vendedor a partir da página de um produto."
                />
            }
            renderItem={({ item }) =>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir conversa com ${item.seller.name}`}
                    onPress={() => openConversation(item)}
                    style={({ pressed }) => [styles.conversation, pressed && styles.pressed]}
                >
                    <Avatar uri={item.seller.avatar} name={item.seller.name} size={52} />

                    <View style={styles.content}>
                        <View style={styles.row}>
                            <Text numberOfLines={1} style={styles.name}>{item.seller.name}</Text>
                            <Text style={styles.timestamp}>{item.timestamp}</Text>
                        </View>
                        <Text numberOfLines={1} style={styles.product}>{item.productTitle}</Text>
                        <Text numberOfLines={1} style={styles.preview}>{item.lastMessage}</Text>
                    </View>

                    <View style={styles.trailing}>
                        <Badge
                            value={item.unreadCount}
                            accessibilityLabel={`${item.unreadCount} mensagens não lidas`}
                        />
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </View>
                </Pressable>
            }
        />
    </Screen>;
}

const styles = StyleSheet.create({
    page: {
        paddingTop: spacing.md,
        gap: spacing.md
    },
    list: {
        gap: spacing.sm,
        paddingBottom: spacing.xl
    },
    conversation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: 16,
        backgroundColor: colors.surface,
        ...shadows.card
    },
    content: {
        flex: 1,
        gap: spacing.xs
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm
    },
    name: {
        flex: 1,
        color: colors.text,
        fontSize: typography.sizes.body,
        fontWeight: typography.weights.bold
    },
    timestamp: {
        color: colors.textMuted,
        fontSize: typography.sizes.caption
    },
    product: {
        color: colors.primaryDark,
        fontSize: typography.sizes.caption,
        fontWeight: typography.weights.semibold
    },
    preview: {
        color: colors.textMuted,
        fontSize: typography.sizes.body
    },
    trailing: {
        alignItems: 'center',
        gap: spacing.sm
    },
    pressed: {
        opacity: 0.72
    }
});
