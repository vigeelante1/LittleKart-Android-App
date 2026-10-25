import { MaterialIcons } from '@expo/vector-icons';
import { storeClosedLines, type Store } from '@littlekart/shared';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors } from '@/theme';
import { strings } from '@/strings';

/** Amber note on the payment page while the store is closed (Submit Order turns into a disabled "Store closed"). */
export function StoreClosedNotice({ store }: { store: Store }) {
  return (
    <View style={styles.alert}>
      <MaterialIcons name="report-problem" size={22} color={colors.alertWarningIcon} style={styles.icon} />
      <View style={styles.text}>
        <AppText variant="storeClosedTitle" style={styles.title}>
          {strings.storeClosed.alertTitle}
        </AppText>
        <AppText variant="storeClosedBody">{strings.storeClosed.alertBody(storeClosedLines(store).snackbar)}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.alertWarningBg,
  },
  icon: { marginRight: 12, paddingVertical: 7, opacity: 0.9 },
  text: { flex: 1, paddingVertical: 8 },
  title: { marginBottom: 2.8 },
});
