import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import MessageBubble from '../../components/common/MessageBubble';
import Screen from '../../components/layout/Screen';
import sharedStyles from '../../theme/SharedStyles';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import { createId } from '../../utils/helpers';

export default function ChatScreen({ route }) {
    const { sellerName, productTitle, initialMessages = [] } = route.params || {};
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(initialMessages);

    const sendMessage = () => {
        const text = message.trim();
        if (!text) return;

        setMessages((current) => [
            ...current,
            { id: createId('message'), text, sender: 'buyer' }
        ]);
        setMessage('');
    };

    return <Screen contentContainerStyle={styles.page}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
            style={styles.keyboard}
        >
            {sellerName || productTitle ?
                <View style={styles.context}>
                    {productTitle ? <Text style={sharedStyles.sectionTitle}>{productTitle}</Text> : null}
                    {sellerName ? <Text style={styles.seller}>Conversa com {sellerName}</Text> : null}
                </View>
                : null
            }

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messages}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <Text style={sharedStyles.helperNote}>
                        {sellerName
                            ? 'Ainda não existem mensagens. Escreve para esclarecer dúvidas sobre este produto.'
                            : 'Ainda não existem conversas. Contacta um vendedor a partir da página de um produto.'}
                    </Text>
                }
                renderItem={({ item }) =>
                    <MessageBubble
                        message={item.text}
                        own={item.sender === 'buyer'}
                    />
                }
            />

            {sellerName ?
                <View style={styles.composer}>
                    <Input
                        placeholder="Escreve uma mensagem..."
                        value={message}
                        onChangeText={setMessage}
                        returnKeyType="send"
                        blurOnSubmit={false}
                        onSubmitEditing={sendMessage}
                        style={styles.messageInput}
                    />
                    <Button
                        title="Enviar"
                        disabled={!message.trim()}
                        onPress={sendMessage}
                        style={styles.sendButton}
                    />
                </View>
                : null
            }
        </KeyboardAvoidingView>
    </Screen>;
}

const styles = StyleSheet.create({
    page: {
        paddingTop: spacing.md
    },
    keyboard: {
        flex: 1,
        gap: spacing.md
    },
    context: {
        padding: spacing.md,
        borderRadius: 16,
        backgroundColor: colors.cream,
        gap: spacing.xs
    },
    seller: {
        color: colors.textMuted,
        fontSize: typography.sizes.body
    },
    messages: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        gap: spacing.sm,
        paddingVertical: spacing.sm
    },
    composer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: spacing.sm
    },
    messageInput: {
        flex: 1
    },
    sendButton: {
        paddingHorizontal: spacing.md
    }
});
