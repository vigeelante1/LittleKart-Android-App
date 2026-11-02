import { MaterialIcons } from '@expo/vector-icons';
import { slotLabel, type DeliverySlot } from '@littlekart/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { useNow } from '@/hooks/useNow';
import { colors, hairline } from '@/theme';
import { strings } from '@/strings';

interface Props {
  slot: DeliverySlot;
  onChange: () => void;
}

/** Payment page: the chosen delivery slot, with Change (D-103). */
export function ScheduledSlotCard({ slot, onChange }: Props) {
  const now = useNow(60_000);
  return (
    <View style={styles.card}>
      <MaterialIcons name="schedule" size={22} color={colors.primary} />
      <View style={styles.text}>
        <AppText variant="scheduleCardTitle">{strings.schedule.cardTitle}</AppText>
        <AppText variant="scheduleCardBody">{slotLabel(slot, now)}</AppText>
      </View>
      <Pressable onPress={onChange} accessibilityRole="button" hitSlop={8}>
        <AppText variant="viewAll">{strings.schedule.change}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: hairline,
    borderColor: colors.freeDeliveryBorder,
    backgroundColor: colors.welcomeInfoBg,
  },
  text: { flex: 1, minWidth: 0 },
});
