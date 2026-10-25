import { Image, type ImageContentFit } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, type StyleProp, type ImageStyle } from 'react-native';
import { resolveImage, type PlaceholderRole } from '@/assets/resolveImage';

interface Props {
  uri: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  accessibilityLabel?: string;
  /** Placeholder shown while a photo loads and if it fails (no network, removed file). */
  fallback?: PlaceholderRole;
}

/** Product, category and banner images. Seed keys ("asset:product") map to local files; photos are https URLs. */
export function ProductImage({ uri, style, contentFit = 'contain', accessibilityLabel, fallback = 'product' }: Props) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const placeholder = resolveImage(`asset:${fallback}`);
  const source = failedUri === uri ? placeholder : resolveImage(uri);
  return (
    <Image
      source={source}
      placeholder={placeholder}
      placeholderContentFit="contain"
      style={[styles.image, style]}
      contentFit={contentFit}
      transition={150}
      cachePolicy="memory-disk"
      recyclingKey={uri}
      onError={() => setFailedUri(uri)}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
});
