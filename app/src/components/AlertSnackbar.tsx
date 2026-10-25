import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors } from '@/theme';
import { strings } from '@/strings';
import { AppText } from './AppText';

export interface AlertMessage {
  message: string;
  severity: 'success' | 'info' | 'warning';
}

interface Props {
  alert: AlertMessage | null;
  onHide: () => void;
  /** The live cart hides it after 3 s. */
  durationMs?: number;
}

const tones = {
  success: { bg: colors.alertSuccessBg, text: 'alertSuccessText', icon: colors.alertSuccessIcon, name: 'check-circle-outline' },
  info: { bg: colors.alertInfoBg, text: 'alertInfoText', icon: colors.alertInfoIcon, name: 'info-outline' },
  warning: { bg: colors.alertWarningBg, text: 'alertWarningText', icon: colors.alertWarningIcon, name: 'report-problem' },
} as const;

/** Light MUI "standard" Alert in a snackbar, 10% above the bottom (coupon applied / removed in the cart). */
export function AlertSnackbar({ alert, onHide, durationMs = 3000 }: Props) {
  const { height } = useWindowDimensions();

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [alert, durationMs, onHide]);

  if (!alert) return null;
  const tone = tones[alert.severity];
  return (
    <View style={[styles.wrap, { bottom: height * 0.1 }]} pointerEvents="box-none">
      <View accessibilityRole="alert" style={[styles.alert, { backgroundColor: tone.bg }]}>
        <MaterialIcons name={tone.name} size={22} color={tone.icon} style={styles.icon} />
        <AppText variant="alertMessage" color={tone.text} style={styles.message}>
          {alert.message}
        </AppText>
        <Pressable onPress={onHide} accessibilityRole="button" accessibilityLabel={strings.common.close} hitSlop={6} style={styles.close}>
          <MaterialIcons name="close" size={20} color={colors[tone.text]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 8, right: 8, zIndex: 50 },
  alert: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 4 },
  icon: { marginRight: 12, paddingVertical: 7, opacity: 0.9 },
  message: { flex: 1, paddingVertical: 8 },
  close: { marginLeft: 16, marginRight: -8, padding: 5, marginTop: 4 },
});
