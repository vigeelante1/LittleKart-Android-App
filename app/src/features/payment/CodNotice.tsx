import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors } from '@/theme';
import { strings } from '@/strings';

/** Blue note shown instead of the Cash on Delivery option when it can't be used. */
export function CodNotice({ message }: { message: string }) {
  return (
    <View style={styles.alert}>
      <MaterialIcons name="info-outline" size={22} color={colors.info} style={styles.icon} />
      <View style={styles.text}>
        <AppText variant="codNoticeTitle" style={styles.title}>
          {strings.payment.upiRequired}
        </AppText>
        <AppText variant="codNoticeBody">{message}</AppText>
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
    backgroundColor: colors.codNoticeBg,
  },
  icon: { marginRight: 12, paddingVertical: 7, opacity: 0.9 },
  text: { flex: 1, paddingVertical: 8 },
  title: { marginBottom: 2.8 },
});
