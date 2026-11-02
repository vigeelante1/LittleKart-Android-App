import { MaterialIcons } from '@expo/vector-icons';
import { slotDay, slotTimes, storeClosedLines, type DeliverySlot, type Store } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { useNow } from '@/hooks/useNow';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  visible: boolean;
  store: Store;
  slots: readonly DeliverySlot[];
  /** Start of the slot already chosen, if any. */
  selected?: number;
  confirmLabel: string;
  onConfirm: (slot: DeliverySlot) => void;
  onClose: () => void;
}

/** "Schedule delivery": one-hour slots for the next opening hours, grouped by day (D-103). */
export function SlotSheet({ visible, store, slots, selected, confirmLabel, onConfirm, onClose }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const [picked, setPicked] = useState<number | undefined>(selected);
  const choice = slots.find((s) => s.start === (picked ?? selected));

  const days: { label: string; slots: DeliverySlot[] }[] = [];
  for (const s of slots) {
    const label = slotDay(s.start, now);
    const day = days.find((d) => d.label === label);
    if (day) day.slots.push(s);
    else days.push({ label, slots: [s] });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="none" />
      <View style={[styles.sheet, { maxHeight: height - 96 }]}>
        <View style={styles.handle} />
        <LinearGradient colors={colors.recSheetHeaderGradient} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={styles.badge}>
            <MaterialIcons name="schedule" size={22} color={colors.white} />
          </View>
          <View style={styles.headText}>
            <AppText variant="recTitle">{strings.schedule.title}</AppText>
            <AppText variant="scheduleSub">{strings.schedule.sub(storeClosedLines(store).backAt)}</AppText>
          </View>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={strings.schedule.close} style={styles.close}>
            <MaterialIcons name="close" size={24} color={colors.iconMuted} />
          </Pressable>
        </LinearGradient>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {days.map((day) => (
            <View key={day.label} style={styles.day}>
              <AppText variant="scheduleDay">{day.label}</AppText>
              <View style={styles.grid}>
                {day.slots.map((s) => {
                  const on = s.start === choice?.start;
                  return (
                    <Pressable
                      key={s.start}
                      onPress={() => setPicked(s.start)}
                      accessibilityRole="radio"
                      aria-checked={on}
                      accessibilityLabel={`${day.label}, ${slotTimes(s)}`}
                      style={({ pressed }) => [styles.chip, on && styles.chipOn, pressed && !on && styles.chipPressed]}
                    >
                      <AppText variant={on ? 'scheduleChipOn' : 'scheduleChip'} align="center">
                        {slotTimes(s)}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
          <Pressable
            onPress={() => choice && onConfirm(choice)}
            disabled={!choice}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, !choice && styles.buttonOff, pressed && styles.buttonPressed]}
          >
            <AppText variant="scheduleButton">{choice ? confirmLabel : strings.schedule.pick}</AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.dialogBackdrop },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.surface,
    boxShadow: shadows.muiElevation16,
  },
  handle: { width: 36, height: 4, borderRadius: 2, marginTop: 10, alignSelf: 'center', backgroundColor: colors.sheetHandle },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: colors.recSheetHeaderBorder,
  },
  badge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  headText: { flex: 1, minWidth: 0, gap: 2 },
  close: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: hairline,
    borderColor: colors.closeButtonBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.closeButton,
  },
  body: { flexGrow: 0, backgroundColor: colors.recSheetBodyBg },
  bodyContent: { padding: 12, gap: 14 },
  day: { gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexBasis: '47%',
    flexGrow: 1,
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipPressed: { backgroundColor: colors.primaryLight },
  footer: { paddingTop: 12, paddingHorizontal: 12, borderTopWidth: hairline, borderTopColor: colors.sheetDivider, backgroundColor: colors.surface },
  button: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  buttonOff: { backgroundColor: colors.muiDisabledFill },
  buttonPressed: { backgroundColor: colors.primaryDark },
});
