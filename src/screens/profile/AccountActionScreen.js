import { useLayoutEffect, useRef, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreventRemove } from '@react-navigation/native';
import Screen from '../../components/layout/Screen';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';

export default function AccountActionScreen({ route, navigation }) {
  const { user, closeAccount, reactivate } = useAuth();
  const mode = route.params?.mode || 'deactivate';
  const removing = mode === 'delete';
  const returning = mode === 'reactivate';
  const title = removing ? 'Remover conta' : returning ? 'Reativar conta' : 'Desativar temporariamente';
  const [email, setEmail] = useState(user?.email || route.params?.email || '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  usePreventRemove(busy, () => {});
  useLayoutEffect(() => { navigation.setOptions({ title, headerBackVisible: !busy, gestureEnabled: !busy }); }, [navigation, title, busy]);
  const run = async () => {
    if (locked.current) return;
    locked.current = true; setBusy(true); Keyboard.dismiss();
    try {
      if (returning) await reactivate({ email: email.trim(), password });
      else await closeAccount(mode, { email: email.trim(), password });
      setPassword('');
    } catch (error) { Alert.alert('Não foi possível concluir', error.message); }
    finally { locked.current = false; setBusy(false); }
  };
  const submit = () => {
    if (!password || !email.trim() || busy) return;
    Alert.alert(`${title}?`, removing
      ? 'Esta ação é permanente. Os teus anúncios, fotografia, dados de perfil, favoritos e conteúdo das mensagens enviadas serão removidos. Não poderás recuperar a conta.'
      : returning ? 'A conta ficará ativa. Os anúncios continuarão ocultos até os voltares a ativar individualmente.'
      : 'O teu perfil e anúncios ficarão ocultos e as conversas passarão a apenas leitura para as outras pessoas. Vais sair da conta em todos os dispositivos.', [
      { text: 'Cancelar', style: 'cancel' }, { text: removing ? 'Remover definitivamente' : returning ? 'Reativar' : 'Desativar', style: removing ? 'destructive' : 'default', onPress: run }
    ]);
  };
  const effects = removing ? [
    ['Anúncios e fotografias', 'Todos os teus anúncios e imagens serão removidos, incluindo os inativos e esgotados.'],
    ['Conversas', 'O conteúdo das mensagens que enviaste será substituído por “Mensagem removida”. As mensagens escritas pela outra pessoa permanecem no histórico dela, associado a “Conta eliminada”.'],
    ['Dados e acesso', 'Os teus dados de perfil e favoritos serão eliminados. As sessões terminam em todos os dispositivos e deixam de ser enviadas novas notificações. Não existe recuperação da conta.'],
    ['Se houver uma falha', 'A conta fica indisponível logo que o pedido seja aceite. A limpeza continua automaticamente e podes consultar aqui o estado do pedido.']
  ] : returning ? [
    ['O teu perfil regressa', 'Os dados, favoritos e conversas são preservados. Poderás voltar a enviar e receber mensagens.'],
    ['Revê os anúncios', 'Os anúncios ficam inativos. Consulta “Os meus anúncios” e ativa apenas os que continuam disponíveis.']
  ] : [
    ['Perfil e anúncios ocultos', 'Deixas de aparecer no marketplace. Os anúncios e a respetiva disponibilidade ficam guardados.'],
    ['Conversas em pausa', 'Não será possível enviar-te mensagens. As outras pessoas continuam a consultar o histórico da conversa.'],
    ['Dados preservados', 'Manténs os teus dados, favoritos e mensagens. Todas as sessões terminam e as novas notificações ficam interrompidas.'],
    ['Regressa quando quiseres', 'Inicia sessão e escolhe “Reativar conta”. Os anúncios só voltam a aparecer depois de os ativares individualmente.']
  ];
  return <Screen scroll safeAreaEdges={['bottom', 'left', 'right']} contentContainerStyle={styles.page}>
    <View style={styles.heading}>
      <Ionicons name={removing ? 'trash-outline' : returning ? 'lock-open-outline' : 'pause-circle-outline'} size={36} color={removing ? colors.error : colors.primaryDarkFigo} />
      <Text accessibilityRole="header" style={styles.title}>{removing ? 'Uma decisão permanente' : returning ? 'Queres voltar à Figo?' : 'Faz uma pausa'}</Text>
    </View>
    {effects.map(([heading, text]) => <View key={heading} style={styles.card}><Text style={styles.cardTitle}>{heading}</Text><Text style={styles.copy}>{text}</Text></View>)}
    <Input label="Email da conta" value={email} onChangeText={setEmail} editable={!user && !busy} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} accessibilityLabel="Email da conta" />
    <Input label="Confirma a tua palavra-passe" value={password} onChangeText={setPassword} editable={!busy} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="password" autoComplete="current-password" maxLength={128} accessibilityLabel="Palavra-passe atual" />
    {!user && <Button variant="secondary" title="Esqueci-me da palavra-passe" disabled={busy} onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)} />}
    <Button title={title} icon={removing ? 'trash-outline' : undefined} loading={busy} disabled={!email.trim() || !password} onPress={submit} style={removing && styles.destructive} />
    {returning && <Button title="Prefiro remover a conta" variant="secondary" disabled={busy} onPress={() => { setPassword(''); navigation.push(ROUTES.ACCOUNT_ACTION, { mode: 'delete', email }); }} />}
  </Screen>;
}
const styles = StyleSheet.create({
  page: { gap: 16, paddingTop: 24, paddingBottom: 28, width: '100%', maxWidth: 560, alignSelf: 'center' },
  heading: { gap: 12, marginBottom: 4 }, title: { fontSize: 25, fontWeight: '700', color: colors.text },
  card: { padding: 16, borderRadius: 16, backgroundColor: colors.surface, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text }, copy: { fontSize: 14, lineHeight: 21, color: colors.textMuted },
  destructive: { backgroundColor: colors.error }
});
