import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatPrice } from '../../utils/formatters';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function PurchaseSheet({ sheet, sellerName, busy, error, onChange, onClose, onSubmit }) {
  if (!sheet) return null;
  const proposal = sheet.type === 'propose';
  const review = sheet.type === 'review';
  const agreement = ['confirm-buyer', 'confirm-seller'].includes(sheet.type);
  const agreementAction = sheet.type === 'confirm-buyer' ? 'Confirmar compra' : 'Confirmar venda';
  const quantityLocked = busy || sheet.uncertain;
  const title = proposal ? sheet.repeat ? 'Comprar novamente' : 'Propor compra' : review ? 'Avaliar vendedor' : agreement ? agreementAction : 'A compra foi concluída?';
  return <Modal transparent visible animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Fechar" disabled={busy} onPress={onClose} />
      <SafeAreaView edges={['bottom', 'left', 'right']} accessibilityViewIsModal style={styles.sheet}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" disabled={busy} onPress={onClose} style={styles.close}>
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
          </View>
          {proposal ? <>
            {sheet.repeat && !sheet.uncertain ? <Text style={styles.description}>Nova proposta com o preço atual do produto. Confirma a quantidade antes de enviar.</Text> : null}
            <View style={styles.product}><Text style={styles.label}>{sheet.product.title}</Text>
              <Text style={styles.description}>{formatPrice(sheet.product.price)} / {sheet.product.unit.replace(/^€\s*\/\s*/, '')}</Text></View>
            <Text style={styles.label}>Quantidade</Text>
            <View style={styles.quantity}>
              <Pressable accessibilityRole="button" accessibilityLabel="Diminuir quantidade" accessibilityState={{ disabled: quantityLocked || sheet.quantity <= 1 }} disabled={quantityLocked || sheet.quantity <= 1}
                onPress={() => onChange({ quantity: sheet.quantity - 1 })} style={[styles.step, (quantityLocked || sheet.quantity <= 1) && styles.disabled]}><Ionicons name="remove" size={24} color={colors.primaryDarkFigo} /></Pressable>
              <Text accessibilityLiveRegion="polite" style={styles.quantityValue}>{sheet.quantity}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Aumentar quantidade" accessibilityState={{ disabled: quantityLocked || sheet.quantity >= 9999 }} disabled={quantityLocked || sheet.quantity >= 9999}
                onPress={() => onChange({ quantity: sheet.quantity + 1 })} style={[styles.step, (quantityLocked || sheet.quantity >= 9999) && styles.disabled]}><Ionicons name="add" size={24} color={colors.primaryDarkFigo} /></Pressable>
            </View>
            <View style={styles.total}><Text style={styles.label}>Total indicativo</Text><Text style={styles.amount}>{formatPrice(Math.round((sheet.product.price * sheet.quantity + Number.EPSILON) * 100) / 100)}</Text></View>
            <Text style={styles.description}>Pagamento e entrega a combinar diretamente entre vocês.</Text>
            {sheet.uncertain ? <Text style={styles.description}>Existe um envio por confirmar. Tenta enviar novamente para recuperar o resultado da mesma proposta.</Text> : null}
          </> : review ? <>
            <Text style={styles.description}>Como correu a experiência com {sellerName}?</Text>
            <View style={styles.stars} accessibilityRole="radiogroup" accessibilityLabel="Classificação obrigatória">
              {[1, 2, 3, 4, 5].map(rating => <Pressable key={rating} accessibilityRole="radio" accessibilityLabel={`${rating} ${rating === 1 ? 'estrela' : 'estrelas'}`}
                accessibilityState={{ checked: sheet.rating === rating, disabled: busy }} disabled={busy} onPress={() => onChange({ rating })} style={styles.star}>
                <Ionicons name={sheet.rating >= rating ? 'star' : 'star-outline'} size={36} color={colors.primaryDarkFigo} />
              </Pressable>)}
            </View>
            <Input label="Comentário (opcional)" placeholder="Conta-nos como correu a experiência..." multiline maxLength={2000} value={sheet.comment} editable={!busy} onChangeText={comment => onChange({ comment })} />
          </> : agreement ? <>
            <View style={styles.product}><Text style={styles.label}>{sheet.purchase.quantity} × {sheet.purchase.productTitle}</Text>
              <Text style={styles.description}>Total indicativo: {formatPrice(sheet.purchase.totalPriceSnapshot)}</Text></View>
            <Text style={styles.description}>Confirma que estão de acordo com os detalhes finais da compra, incluindo local, horário e forma de pagamento.</Text>
            <Text style={styles.description}>Esta confirmação regista o acordo entre vocês. A entrega e o pagamento são tratados diretamente entre comprador e vendedor.</Text>
          </> : <Text style={[styles.description, styles.confirm]}>Confirma apenas depois de receberes o produto e concluíres o pagamento diretamente com o vendedor.</Text>}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Button title={proposal ? 'Enviar proposta' : review ? 'Enviar avaliação' : agreement ? agreementAction : 'Sim, compra concluída'} loading={busy} disabled={review && !sheet.rating} onPress={onSubmit} />
          <Button title={proposal || review ? 'Cancelar' : 'Ainda não'} variant="secondary" disabled={busy} onPress={onClose} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  </Modal>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { maxHeight: '90%', width: '100%', maxWidth: 560, alignSelf: 'center', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  content: { padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.text },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  product: { gap: spacing.xs, padding: spacing.md, borderRadius: 14, backgroundColor: colors.surface },
  label: { fontSize: 16, fontWeight: '600', color: colors.text },
  description: { fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  confirm: { textAlign: 'center', paddingVertical: spacing.sm },
  quantity: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  step: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLightFigo },
  disabled: { opacity: 0.4 },
  quantityValue: { minWidth: 54, textAlign: 'center', color: colors.text, fontSize: 24, fontWeight: '700' },
  total: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  amount: { fontSize: 24, fontWeight: '700', color: colors.primaryDarkFigo },
  stars: { flexDirection: 'row', justifyContent: 'center' },
  star: { flex: 1, maxWidth: 56, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.error, lineHeight: 20 }
});
