import { Image, type ImageContentFit } from 'expo-image';
import { StyleSheet, type StyleProp, type ImageStyle } from 'react-native';
import { resolveImage } from '@/assets/resolveImage';

interface Props {
  uri: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  accessibilityLabel?: string;
}

/** Product, category and banner images. Seed keys ("asset:product") map to local files. */
export function ProductImage({ uri, style, contentFit = 'contain', accessibilityLabel }: Props) {
  return (
    <Image
      source={resolveImage(uri)}
      style={[styles.image, style]}
      contentFit={contentFit}
      transition={150}
      cachePolicy="memory-disk"
      accessibilityLabel={accessibilityLabel}
    />
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
});
