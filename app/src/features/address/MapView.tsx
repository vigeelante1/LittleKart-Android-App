import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { colors } from '@/theme';
import { mapHtml, type MapMessage } from './mapHtml';

export interface MapViewHandle {
  moveTo: (lat: number, lng: number, zoom?: number) => void;
}

interface Props {
  /** Where the map opens. Later moves go through `moveTo`. */
  initial: { lat: number; lng: number };
  onMoveStart: () => void;
  /** The centre after the user dragged or tapped the map (programmatic moves are not reported). */
  onUserMove: (lat: number, lng: number) => void;
  onReady?: () => void;
  onError?: () => void;
}

/** Street map that slides under a fixed centre pin (OpenStreetMap data; DECISIONS D-13, D-62). */
export const MapView = forwardRef<MapViewHandle, Props>(function MapView(
  { initial, onMoveStart, onUserMove, onReady, onError },
  ref,
) {
  const web = useRef<WebView>(null);
  // Built once: the page keeps its own position afterwards.
  const [lat0, lng0] = [initial.lat, initial.lng];
  const html = useMemo(() => mapHtml(lat0, lng0, 17), [lat0, lng0]);

  useImperativeHandle(ref, () => ({
    moveTo: (lat, lng, zoom) => {
      web.current?.injectJavaScript(`window.__moveTo && window.__moveTo(${lat}, ${lng}, ${zoom ?? 'undefined'}); true;`);
    },
  }));

  const onMessage = (event: WebViewMessageEvent) => {
    let msg: MapMessage;
    try {
      msg = JSON.parse(event.nativeEvent.data) as MapMessage;
    } catch {
      return;
    }
    if (msg.type === 'ready') onReady?.();
    else if (msg.type === 'error') onError?.();
    else if (msg.type === 'movestart' && msg.user) onMoveStart();
    else if (msg.type === 'moveend' && msg.user) onUserMove(msg.lat, msg.lng);
  };

  // The web preview has no WebView; the phone build always has one.
  if (Platform.OS === 'web') return <View style={[StyleSheet.absoluteFill, styles.placeholder]} />;

  return (
    <WebView
      ref={web}
      source={{ html, baseUrl: 'https://littlekart.local/' }}
      originWhitelist={['*']}
      onMessage={onMessage}
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      overScrollMode="never"
      style={StyleSheet.absoluteFill}
      containerStyle={styles.placeholder}
    />
  );
});

const styles = StyleSheet.create({
  placeholder: { backgroundColor: colors.mapBg },
});
