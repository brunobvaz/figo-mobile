import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';

export default function EventPhoto({ image, title, style }) {
  const [failedImage, setFailedImage] = useState(null);
  return image && failedImage !== image
    ? <Image source={{ uri: image }} resizeMode="cover" accessibilityLabel={title} style={[styles.photo, style]} onError={() => setFailedImage(image)} />
    : null;
}
const styles = StyleSheet.create({ photo: { width: '100%' } });
