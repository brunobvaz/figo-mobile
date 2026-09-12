import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import colors from '../../theme/colors';
import sharedStyles from '../../theme/SharedStyles';
import { ROUTES } from '../../navigation/routes';

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>

      <Image
        source={require('../../../assets/splash-mobile-transparent.png')}
        style={styles.background}
        resizeMode="cover"
        accessible={false}
      />
      <View style={styles.screenContent}>
        <Image
          source={require('../../../assets/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="FiGO"
        />
        <Text style={[sharedStyles.sectionTitle, styles.tagline]}>
          Fresco. Natural.{'\n'}Da nossa quinta, à sua casa
        </Text>

        <Text style={[sharedStyles.screenSubtitle, styles.description]}>
          Seleção diária de fruta, legumes e{'\n'}
          produtos naturais.
        </Text>
      </View>
      <View style={[styles.actions, {
        bottom: insets.bottom + 52,
        left: insets.left + 24,
        right: insets.right + 24,
      }]}>
        <Button title="Entrar" onPress={() => navigation.navigate(ROUTES.LOGIN)} style={styles.button} />
        <Button title="Registar" onPress={() => navigation.navigate(ROUTES.REGISTER)} variant="secondary" style={styles.button} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  background: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  logo: { width: 200, height: 200 },
 
  description: {
    marginTop: 20,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  tagline: { marginTop: 20, paddingHorizontal: 24, textAlign: 'center', color: colors.primaryDarkFigo, },
  actions: { position: 'absolute', alignItems: 'center', gap: 12 },
  button: { width: '100%', maxWidth: 400 },
});
