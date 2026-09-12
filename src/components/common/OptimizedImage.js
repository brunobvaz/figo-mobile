import { useState } from 'react';
import { Image } from 'react-native';
import { imageVariantUri } from '../../utils/imageVariants';

export default function OptimizedImage({ source, imageWidth = 640, onError, ...props }) {
  const [failedVariant, setFailedVariant] = useState(null);
  const original = source?.uri;
  const variant = imageVariantUri(original, imageWidth);
  const uri = failedVariant === variant ? original : variant;
  return <Image {...props} source={original ? { ...source, uri, cache: 'force-cache' } : source}
    fadeDuration={0} progressiveRenderingEnabled
    onError={event => {
      if (uri !== original) setFailedVariant(variant);
      else onError?.(event);
    }} />;
}
