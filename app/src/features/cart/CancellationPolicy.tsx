import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

/** "Cancellation Policy" card (centred, as on littlekart.com). */
export function CancellationPolicy() {
  return (
    <View style={styles.card}>
      <AppText variant="policyTitle" align="center" style={styles.title}>
        {strings.cancellation.title}
      </AppText>
      <AppText variant="policyBody" align="center">
        {strings.cancellation.body}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: hairline,
    borderColor: colors.borderPolicy,
    backgroundColor: colors.softCard,
    boxShadow: shadows.policyCard,
  },
  title: { marginBottom: 7 },
});
