import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';

export default function RecipePhoto({ image, title, style }) {
  const [failedImage, setFailedImage] = useState(null);
  const source = typeof image === 'string' ? { uri: image } : image;
  return source && failedImage !== image
    ? <Image source={source} resizeMode="cover" accessibilityLabel={title} style={[styles.photo, style]} onError={() => setFailedImage(image)} />
    : <View style={[styles.photo, styles.placeholder, style]} accessibilityLabel="Imagem de receita indisponível">
      <MaterialCommunityIcons name="silverware-fork-knife" size={36} color={colors.primaryDark} />
    </View>;
}
const styles = StyleSheet.create({
  photo: { width: '100%', backgroundColor: colors.primaryLight },
  placeholder: { alignItems: 'center', justifyContent: 'center' }
});
