import Screen from '../../components/layout/Screen';
import Button from '../../components/common/Button';
import { ROUTES } from '../../navigation/routes';
import spacing from '../../theme/spacing';
export default function LegalInfoScreen({ navigation }) {
  return <Screen contentContainerStyle={{ paddingTop: spacing.lg, gap: spacing.md }}>
    <Button title="Termos e Condições" variant="secondary" onPress={() => navigation.navigate(ROUTES.LEGAL_DOCUMENT, { document: 'terms', title: 'Termos e Condições' })} />
    <Button title="Política de Privacidade" variant="secondary" onPress={() => navigation.navigate(ROUTES.LEGAL_DOCUMENT, { document: 'privacy', title: 'Política de Privacidade' })} />
  </Screen>;
}
