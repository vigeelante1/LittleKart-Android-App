import { useMemo } from 'react';
import { Linking, Modal, Platform, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import type { RazorpayCheckout } from '@/services';
import { colors } from '@/theme';
import { checkoutHtml, type CheckoutMessage } from './razorpayHtml';

interface Props {
  checkout: RazorpayCheckout | null;
  name: string;
  description: string;
  customerName: string;
  phone: string;
  onResult: (message: CheckoutMessage) => void;
}

/** UPI apps open through links such as upi://pay or intent://; everything else stays in the sheet. */
function openOutside(request: ShouldStartLoadRequest): boolean {
  const url = request.url;
  if (/^(https?:|about:|data:|blob:)/i.test(url)) return true;
  void Linking.openURL(url).catch(() => undefined);
  return false;
}

/** Razorpay's payment sheet over the payment page (DECISIONS D-68). */
export function RazorpaySheet({ checkout, name, description, customerName, phone, onResult }: Props) {
  const html = useMemo(
    () => (checkout ? checkoutHtml({ checkout, name, description, customerName, phone }) : ''),
    [checkout, name, description, customerName, phone],
  );

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      onResult(JSON.parse(event.nativeEvent.data) as CheckoutMessage);
    } catch {
      // Ignore anything that isn't ours.
    }
  };

  if (!checkout) return null;
  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => onResult({ type: 'dismiss' })}>
      <View style={styles.root}>
        {Platform.OS === 'web' ? null : (
          <WebView
            source={{ html, baseUrl: 'https://littlekart.local/' }}
            originWhitelist={['*']}
            onMessage={onMessage}
            onShouldStartLoadWithRequest={openOutside}
            setSupportMultipleWindows={false}
            javaScriptEnabled
            domStorageEnabled
            style={styles.web}
            containerStyle={styles.web}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.modalBackdrop },
  web: { flex: 1, backgroundColor: 'transparent' },
});
