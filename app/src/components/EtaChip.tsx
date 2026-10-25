import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';
import { strings } from '@/strings';
import { AppText } from './AppText';

interface Props {
  minutes: number;
}

/** Beige "⏱ 15 MINS" chip on product cards. */
export function EtaChip({ minutes }: Props) {
  return (
    <View style={styles.chip}>
      <MaterialIcons name="access-time" size={12.8} color={colors.etaChipIcon} />
      <AppText variant="etaChip">{strings.product.etaMins(minutes)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.88,
    paddingHorizontal: 5.76,
    marginBottom: 3.6,
    borderRadius: 7,
    backgroundColor: colors.etaChipBg,
  },
});
