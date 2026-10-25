import { MaterialIcons } from '@expo/vector-icons';
import {
  couponShortfallMessage,
  couponStatuses,
  filterCouponStatuses,
  type Coupon,
  type CouponStatus,
  type PricedLine,
} from '@littlekart/shared';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { CartIcon } from '@/components/icons/CartIcons';
import { colors, hairline, interFamily, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  visible: boolean;
  /** Null while loading. */
  coupons: readonly Coupon[] | null;
  loadError: boolean;
  lines: readonly PricedLine[];
  onClose: () => void;
  /** Returns an error message, or null when the coupon was applied (the dialog then closes). */
  onApply: (code: string) => string | null;
}

/** The live list waits 350 ms after typing before it searches. */
const SEARCH_DELAY_MS = 350;

/** "Apply Coupons" sheet over the cart (littlekart.com; DESIGN_SPEC S19). */
export function ApplyCouponsDialog(props: Props) {
  // Mounted per opening, so the field and the message start empty each time.
  return props.visible ? <ApplyCouponsContent {...props} /> : null;
}

function ApplyCouponsContent({ visible, coupons, loadError, lines, onClose, onApply }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [term, setTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setTerm(code.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [code]);

  const statuses = useMemo(
    () => (coupons ? filterCouponStatuses(couponStatuses(coupons, lines), term) : null),
    [coupons, lines, term],
  );

  const apply = (value: string) => {
    const message = onApply(value);
    if (message) setError(message);
  };
  const canApply = code.trim().length > 0;
  const message = error || (loadError ? strings.coupons.loadFailed : '');

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="none" />
      <View style={[styles.paper, { maxHeight: height - 64 }]}>
        <View style={styles.titleBar}>
          <View style={styles.titleLeft}>
            <View style={styles.titleTile}>
              <CartIcon name="localOffer" size={17} color={colors.primaryDark} />
            </View>
            <AppText variant="couponDialogTitle">{strings.coupons.title}</AppText>
          </View>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={strings.common.close} style={styles.close}>
            <MaterialIcons name="close" size={20} color={colors.iconMuted} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.flexShrink}
          contentContainerStyle={[styles.content, { paddingBottom: 16 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputRow}>
            <View style={styles.field}>
              <MaterialIcons name="search" size={18} color={colors.dialogClose} style={styles.searchIcon} />
              <TextInput
                value={code}
                onChangeText={(t) => {
                  setCode(t.toUpperCase());
                  setError('');
                }}
                onSubmitEditing={() => canApply && apply(code)}
                placeholder={strings.coupons.placeholder}
                placeholderTextColor={colors.inputPlaceholder}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                allowFontScaling={false}
                selectionColor={colors.brightGreen}
                style={styles.input}
              />
              <AppText variant="muiCaption" style={styles.searchHint}>
                {strings.coupons.searchHint}
              </AppText>
            </View>
            <Pressable
              onPress={() => apply(code)}
              disabled={!canApply}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canApply }}
              style={({ pressed }) => [styles.applyButton, !canApply && styles.applyDisabled, pressed && canApply && styles.pressed]}
            >
              <AppText variant={canApply ? 'sheetApply' : 'couponApplyDisabled'}>{strings.coupons.apply}</AppText>
            </Pressable>
          </View>

          <AppText variant="couponSection" style={styles.section}>
            {strings.coupons.available}
          </AppText>
          {message ? (
            <AppText variant="couponError" style={styles.section}>
              {message}
            </AppText>
          ) : null}

          {statuses === null ? null : statuses.length === 0 ? (
            <AppText variant="couponNote">{strings.coupons.none}</AppText>
          ) : statuses.every((s) => !s.applicable) ? (
            <View style={styles.list}>
              <AppText variant="couponNote" style={styles.noneNote}>
                {strings.coupons.noneApplicable}
              </AppText>
              {statuses.map((s) => (
                <IdleCouponCard key={s.coupon.code} status={s} />
              ))}
            </View>
          ) : (
            <View style={styles.list}>
              {statuses.map((s) => (
                <CouponCard key={s.coupon.code} status={s} onApply={() => apply(s.coupon.code)} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function CodeChip({ code }: { code: string }) {
  return (
    <View style={styles.codeChip}>
      <AppText variant="couponCode">{code}</AppText>
    </View>
  );
}

/** Card in the "nothing applies yet" list: no button (as in the screenshot). */
function IdleCouponCard({ status }: { status: CouponStatus }) {
  return (
    <View style={[styles.card, styles.cardIdle]}>
      <CodeChip code={status.coupon.code} />
      <AppText variant="couponTitleIdle" style={styles.idleTitle}>
        {status.coupon.title}
      </AppText>
      <AppText variant="couponMessage" style={styles.message}>
        {status.exemptOnly ? strings.coupons.exemptOnly : couponShortfallMessage(status.shortfall)}
      </AppText>
    </View>
  );
}

/** Card in the list when at least one coupon applies: green accent and "Apply", or grey and "Not Eligible". */
function CouponCard({ status, onApply }: { status: CouponStatus; onApply: () => void }) {
  const ok = status.applicable;
  return (
    <View style={[styles.card, ok ? styles.cardOk : styles.cardIdle]}>
      <View style={styles.cardRow}>
        <View style={styles.cardText}>
          <View style={styles.chips}>
            <CodeChip code={status.coupon.code} />
            {status.estimatedDiscount > 0 ? (
              <View style={styles.saveChip}>
                <AppText variant="couponSave">{strings.coupons.save(status.estimatedDiscount)}</AppText>
              </View>
            ) : null}
          </View>
          <AppText variant="couponTitle">{status.coupon.title}</AppText>
          {!ok ? (
            <AppText variant="couponMessage" style={styles.message}>
              {status.exemptOnly ? strings.coupons.exemptOnly : couponShortfallMessage(status.shortfall)}
            </AppText>
          ) : null}
          {!ok && !status.exemptOnly && status.shortfall > 0 ? (
            <AppText variant="couponHint" style={styles.hint}>
              {strings.coupons.addMore(status.shortfall)}
            </AppText>
          ) : null}
        </View>
        <Pressable
          onPress={onApply}
          disabled={!ok}
          accessibilityRole="button"
          accessibilityState={{ disabled: !ok }}
          style={({ pressed }) => [styles.cardButton, ok ? styles.cardButtonOk : styles.cardButtonIdle, pressed && ok && styles.pressed]}
        >
          <AppText variant={ok ? 'couponButton' : 'couponButtonDisabled'}>{ok ? strings.coupons.apply : strings.coupons.notEligible}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.dialogBackdrop },
  paper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.surface,
    boxShadow: shadows.muiElevation24,
    overflow: 'hidden',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 9.6,
    borderBottomWidth: hairline,
    borderBottomColor: colors.couponTitleBorder,
  },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleTile: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  flexShrink: { flexShrink: 1 },
  content: { paddingTop: 14, paddingHorizontal: 24 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  field: {
    flex: 1,
    minWidth: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.inputOutline,
    backgroundColor: colors.surface2,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, minWidth: 0, height: 40, paddingVertical: 0, fontFamily: interFamily(400), fontSize: 16, color: colors.text },
  searchHint: { marginLeft: 8 },
  applyButton: {
    minWidth: 84,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.brightGreen,
    boxShadow: shadows.muiElevation2,
  },
  applyDisabled: { backgroundColor: colors.muiDisabledBg, boxShadow: shadows.none },
  pressed: { opacity: 0.85 },
  section: { marginBottom: 9.6 },
  list: { gap: 8 },
  noneNote: { marginBottom: 4 },
  card: {
    padding: 12.8,
    borderWidth: hairline,
    borderColor: colors.couponCardBorder,
    borderLeftWidth: 4,
    borderRadius: 14,
  },
  cardOk: { borderLeftColor: colors.couponAccent, backgroundColor: colors.surface, boxShadow: shadows.couponCard },
  cardIdle: { borderLeftColor: colors.couponAccentIdle, backgroundColor: colors.couponCardIdleBg },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cardText: { flex: 1, minWidth: 0 },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 6.4, marginBottom: 4.8 },
  codeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7.2,
    paddingVertical: 2,
    borderWidth: hairline,
    borderStyle: 'dashed',
    borderColor: colors.mrp,
    borderRadius: 7,
    backgroundColor: colors.surface2,
  },
  saveChip: { paddingHorizontal: 6.4, paddingVertical: 1.6, borderRadius: 999, backgroundColor: colors.couponSaveBg },
  idleTitle: { marginTop: 4.8 },
  message: { marginTop: 3.6 },
  hint: { marginTop: 4 },
  cardButton: {
    minWidth: 86,
    height: 30.75,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  cardButtonOk: { backgroundColor: colors.couponApply, boxShadow: shadows.couponApply },
  cardButtonIdle: { borderWidth: hairline, borderColor: colors.muiDisabledBg },
});
