import { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text } from 'react-native';
import Screen from '../../components/layout/Screen';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { accountClosureStorage } from '../../storage/accountClosureStorage';
import { favoritesStore } from '../../storage/favoritesStore';
import colors from '../../theme/colors';

export default function AccountClosureScreen() {
  const { accountClosure, dismissAccountClosure } = useAuth();
  const [status, setStatus] = useState(accountClosure.status);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    let busy = false;
    const check = async () => {
      if (busy || !accountClosure.receipt || AppState.currentState !== 'active') return;
      busy = true;
      try {
        const result = await authService.deletionStatus(accountClosure.receipt);
        await favoritesStore.clear(accountClosure.userId);
        await accountClosureStorage.save({ ...accountClosure, ...result });
        if (alive) { setStatus(result.status); setError(''); }
      } catch (failure) {
        if (alive) {
          if (failure.status === 404) { setStatus('not_requested'); setError('O servidor não registou um pedido de eliminação. Podes iniciar sessão e tentar novamente.'); }
          else setError(failure.message);
        }
      } finally { busy = false; }
    };
    if (status !== 'deactivated' && status !== 'not_requested') check();
    const timer = setInterval(() => { if (!['deleted', 'not_requested'].includes(status)) check(); }, 10000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') check(); });
    return () => { alive = false; clearInterval(timer); listener.remove(); };
  }, [accountClosure, attempt, status]);
  const pending = ['deletion_pending', 'requesting'].includes(status);
  const titles = { deleted: 'Conta eliminada', deactivated: 'Conta desativada', deletion_pending: 'Eliminação em curso', requesting: 'A confirmar o pedido', not_requested: 'Pedido não registado' };
  return <Screen scroll contentContainerStyle={styles.page}>
    <Text accessibilityRole="header" style={styles.title}>{titles[status]}</Text>
    <Text style={styles.copy}>{status === 'deactivated'
      ? 'O teu perfil e anúncios estão ocultos. Podes reativar a conta ao iniciares sessão. Depois, revê os teus anúncios antes de os voltares a ativar.'
      : status === 'deleted' ? 'Os dados do teu perfil, anúncios, imagens e conteúdo das mensagens enviadas foram removidos. As mensagens escritas pelas outras pessoas permanecem no histórico delas, associado a “Conta eliminada”.'
      : status === 'deletion_pending' ? 'A conta já está indisponível. Estamos a concluir a remoção dos dados. Se houver uma falha, a limpeza será repetida automaticamente.'
      : status === 'requesting' ? 'Ainda não foi possível confirmar se o servidor recebeu o pedido. Este ecrã volta a verificar quando existir ligação. Podes fechar a app e regressar mais tarde.' : 'Podes voltar a entrar na conta.'}</Text>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {accountClosure.receipt && <Button title="Verificar estado" variant="secondary" onPress={() => setAttempt(value => value + 1)} />}
    <Button title="Voltar ao início" onPress={() => dismissAccountClosure(pending)} />
    {pending && <Text style={styles.copy}>Podes voltar a consultar o pedido no ecrã de início.</Text>}
  </Screen>;
}
const styles = StyleSheet.create({ page: { flexGrow: 1, justifyContent: 'center', gap: 22, paddingVertical: 32 }, title: { color: colors.text, fontSize: 28, fontWeight: '700' }, copy: { color: colors.textMuted, fontSize: 16, lineHeight: 24 }, error: { color: colors.error, lineHeight: 21 } });
