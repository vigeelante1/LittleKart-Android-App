import { useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '@/theme';
import { trackingMapHtml } from './trackingMapHtml';

interface Props {
  store: { lat: number; lng: number } | null;
  delivery: { lat: number; lng: number };
}

/** The "Live map" box: store and delivery pins (no delivery partner location without a rider app). */
export function TrackingMap({ store, delivery }: Props) {
  const { height } = useWindowDimensions();
  const [sLat, sLng, dLat, dLng] = [store?.lat, store?.lng, delivery.lat, delivery.lng];
  const html = useMemo(
    () => trackingMapHtml(sLat !== undefined && sLng !== undefined ? { lat: sLat, lng: sLng } : null, { lat: dLat, lng: dLng }),
    [sLat, sLng, dLat, dLng],
  );
  // min(42vh, 320px), at least 220.
  const boxHeight = Math.max(220, Math.min(height * 0.42, 320));
  return (
    <View style={[styles.surface, { height: boxHeight }]}>
      {Platform.OS === 'web' ? null : (
        <WebView
          source={{ html, baseUrl: 'https://littlekart.local/' }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          style={styles.web}
          containerStyle={styles.web}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: { borderRadius: 16, overflow: 'hidden', backgroundColor: colors.mapSurface },
  web: { flex: 1, backgroundColor: colors.mapSurface },
});
