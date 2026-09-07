import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Header from '../../components/layout/Header';
import Screen from '../../components/layout/Screen';
import { useChat } from '../../context/ChatContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Button from '../../components/common/Button';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import shadows from '../../theme/shadows';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function ConversationsScreen({ navigation }) {
    const { conversations, loading, error, refresh, loadMore, hasMore } = useChat();
    useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
    const openConversation = (conversation) => navigation.navigate(ROUTES.CHAT, {
        conversationId: conversation.id,
        participantId: conversation.participant.id,
        participantName: conversation.participant.name,
        productId: conversation.productId,
        productTitle: conversation.productTitle
    });

    return <Screen contentContainerStyle={styles.page}>
        <Header title="Conversas" subtitle="As tuas mensagens com compradores e produtores" />
        <FlatList
            data={conversations}
            refreshing={loading}
            onRefresh={refresh}
            ListHeaderComponent={error ? <Text accessibilityRole="alert" style={styles.preview}>{error}</Text> : null}
            ListFooterComponent={hasMore ? <Button title="Mais conversas" variant="secondary" onPress={loadMore} /> : null}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <EmptyState
                    title={loading ? 'A carregar conversas…' : 'Ainda não tens conversas'}
                    message={loading ? 'A obter as tuas mensagens.' : 'Contacta um vendedor a partir da página de um produto.'}
                />
            }
            renderItem={({ item }) =>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir conversa com ${item.participant.name}`}
                    onPress={() => openConversation(item)}
                    style={({ pressed }) => [styles.conversation, pressed && styles.pressed]}
                >
                    <View><Avatar uri={item.participant.avatar} name={item.participant.name} size={52} /><Badge value={item.unreadCount} style={{ position: 'absolute', right: -4, top: -4 }} accessibilityLabel={`${item.unreadCount} mensagens não lidas`} /></View>

                    <View style={styles.content}>
                        <View style={styles.row}>
                            <Text numberOfLines={1} style={styles.name}>{item.participant.name}</Text>
                            <Text style={styles.timestamp}>{new Date(item.updatedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}</Text>
                        </View>
                        <Text numberOfLines={1} style={styles.product}>{item.productTitle}</Text>
                        <Text numberOfLines={1} style={styles.preview}>{item.lastMessage}</Text>
                    </View>

                    <View style={styles.trailing}>
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
        color: colors.primaryDarkFigo,
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
