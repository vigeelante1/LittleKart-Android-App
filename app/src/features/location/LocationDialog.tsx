import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Modal, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, interFamily, shadows, textVariants } from '@/theme';
import { strings } from '@/strings';
import { useLocationPicker, type LocationPicker } from './useLocationPicker';

interface Props {
  visible: boolean;
  /** "Welcome to Littlekart" for guests, "Change Location" when logged in (as on the site). */
  variant: 'welcome' | 'change';
  /** No location yet: the dialog cannot be closed until one is chosen. */
  required: boolean;
  onClose: () => void;
}

type IconName = ComponentProps<typeof MaterialIcons>['name'];
const ADDRESS_ICONS: Record<string, IconName> = { Home: 'home', Work: 'work', Hotel: 'apartment', Other: 'location-on' };

/** Delivery location dialog (littlekart.com). Becomes a bottom sheet while the keyboard is open, like the site. */
export function LocationDialog(props: Props) {
  // A fresh picker (empty search, no old message) every time the dialog opens.
  return props.visible ? <LocationDialogContent {...props} /> : null;
}

function LocationDialogContent({ visible, variant, required, onClose }: Props) {
  const picker = useLocationPicker(onClose);
  const [keyboard, setKeyboard] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKeyboard(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const sheet = keyboard > 0;
  const close = required ? undefined : onClose;
  // Very narrow phones (under 350 dp, e.g. 320) get 20 px side margins instead of 32, so the button and the
  // search hint stay on one line (iteration 2, DECISIONS D-100).
  const narrow = useWindowDimensions().width < 350;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => close?.()}>
      <View style={[styles.root, sheet && { justifyContent: 'flex-end', paddingBottom: keyboard }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityRole="none" />
        <View style={[styles.paper, sheet ? styles.paperSheet : styles.paperCentered, !sheet && narrow && styles.paperNarrow, variant === 'change' && styles.paperChange]}>
          {!required ? (
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={strings.location.close}
              style={styles.close}
            >
              <MaterialIcons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          ) : null}
          <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
            {variant === 'welcome' ? <WelcomeBody picker={picker} /> : <ChangeBody picker={picker} onClose={onClose} />}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function WelcomeBody({ picker }: { picker: LocationPicker }) {
  return (
    <View>
      <View style={styles.welcomeTitle}>
        <AppText variant="welcomeTitle">{strings.location.welcomeTitle}</AppText>
        <AppText variant="welcomeSub" style={styles.mt8}>
          {strings.location.welcomeSub}
        </AppText>
      </View>
      <View style={styles.welcomeContent}>
        <View style={styles.info}>
          <MaterialIcons name="location-on" size={24} color={colors.welcomeGreen} />
          <AppText variant="welcomeInfo" style={styles.flex}>
            {strings.location.welcomeInfo}
          </AppText>
        </View>
        <View style={styles.welcomeColumn}>
          <Pressable
            onPress={() => void picker.useCurrentLocation()}
            disabled={picker.locating}
            accessibilityRole="button"
            style={({ pressed }) => [styles.welcomeButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="my-location" size={20} color={colors.white} style={styles.startIcon} />
            <AppText variant="welcomeButton" color={picker.locating ? 'disabledText' : 'white'} numberOfLines={1}>
              {picker.locating ? strings.location.fetching : strings.location.useCurrent}
            </AppText>
          </Pressable>
          <AppText variant="welcomeOr" align="center">
            {strings.common.or}
          </AppText>
          <SearchField picker={picker} large />
        </View>
        <Message picker={picker} />
      </View>
    </View>
  );
}

function ChangeBody({ picker, onClose }: { picker: LocationPicker; onClose: () => void }) {
  const addNew = () => {
    onClose();
    router.push({ pathname: '/add-address', params: { from: 'location' } });
  };
  return (
    <View>
      <AppText variant="dialogHeading" style={styles.changeTitle}>
        {strings.location.changeTitle}
      </AppText>
      <View style={styles.changeContent}>
        <View style={styles.changeColumn}>
          <Pressable
            onPress={() => void picker.useCurrentLocation()}
            disabled={picker.locating}
            accessibilityRole="button"
            style={({ pressed }) => [styles.successButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="my-location" size={20} color={colors.white} style={styles.startIcon} />
            <AppText variant="changeButton" color={picker.locating ? 'disabledText' : 'white'}>
              {picker.locating ? strings.location.fetching : strings.location.useCurrent}
            </AppText>
          </Pressable>
          <AppText variant="changeOr" align="center">
            {strings.common.or}
          </AppText>
          <SearchField picker={picker} />
        </View>
        <Message picker={picker} />
        {picker.loadingSaved ? (
          <ActivityIndicator color={colors.brightGreen} style={styles.mt8} />
        ) : (
          <>
            {picker.saved.length > 0 ? <View style={styles.divider} /> : null}
            {/* Alignment fix (DECISIONS D-21 fix 4, D-100): both labels on one line each, never cut off; on narrow
                phones "+ Add New Address" moves under the heading instead of squeezing it. */}
            <View style={[styles.savedHeader, picker.saved.length === 0 && styles.mt8]}>
              <AppText variant="savedHeading" numberOfLines={1} style={styles.savedTitle}>
                {strings.location.saved}
              </AppText>
              <Pressable onPress={addNew} disabled={picker.locating} accessibilityRole="button" style={styles.addNew}>
                <AppText variant="addNew" numberOfLines={1}>
                  {picker.locating ? strings.location.findingLocation : strings.location.addNew}
                </AppText>
              </Pressable>
            </View>
            <View style={styles.savedList}>
              {picker.saved.map((a) => (
                <Pressable key={a.id} onPress={() => void picker.chooseSaved(a)} style={styles.savedItem} accessibilityRole="button">
                  <View style={styles.savedIcon}>
                    <MaterialIcons name={ADDRESS_ICONS[a.label] ?? 'location-on'} size={24} color={colors.brightGreen} />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="listPrimary" style={styles.savedName} numberOfLines={1}>
                      {`${a.name || strings.location.user} | ${a.label || strings.location.savedAddress}`}
                    </AppText>
                    <AppText variant="listSecondary" numberOfLines={2}>
                      {a.text}
                    </AppText>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function SearchField({ picker, large }: { picker: LocationPicker; large?: boolean }) {
  const [focused, setFocused] = useState(false);
  const v = textVariants.listPrimary;
  const border = large
    ? { borderColor: focused ? colors.welcomeGreen : colors.welcomeFieldBorder, borderWidth: focused ? 2 : 1, borderRadius: 14, height: 56 }
    : { borderColor: focused ? colors.brightGreen : colors.inputOutline, borderWidth: focused ? 2 : 1, borderRadius: 4, height: 40 };
  return (
    <View>
      <TextInput
        value={picker.query}
        onChangeText={picker.changeQuery}
        placeholder={strings.location.searchPlaceholder}
        placeholderTextColor={colors.inputPlaceholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        allowFontScaling={false}
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.input, border, { fontFamily: interFamily(v.weight), fontSize: 16, color: colors.text }]}
      />
      {picker.searching ? (
        <AppText variant="caption">{strings.location.searching}</AppText>
      ) : null}
      {picker.showList ? (
        <View style={styles.results}>
          {picker.suggestions.length > 0 ? (
            picker.suggestions.map((s) => (
              <Pressable
                key={`${s.lat}_${s.lng}_${s.text}`}
                disabled={picker.selecting !== null}
                onPress={() => void picker.chooseSuggestion(s)}
                style={({ pressed }) => [styles.resultItem, pressed && styles.resultPressed]}
              >
                <AppText variant="listPrimary" numberOfLines={2}>
                  {s.text}
                </AppText>
              </Pressable>
            ))
          ) : (
            <View style={styles.resultItem}>
              <AppText variant="listPrimary">
                {picker.searched && !picker.searching ? strings.location.noResults : strings.location.searchingNearby}
              </AppText>
            </View>
          )}
        </View>
      ) : null}
      {picker.selecting ? (
        <View style={styles.selecting}>
          <ActivityIndicator size={14} color={colors.brightGreen} />
          <AppText variant="caption">{strings.location.selecting(picker.selecting)}</AppText>
        </View>
      ) : null}
    </View>
  );
}

function Message({ picker }: { picker: LocationPicker }) {
  if (!picker.message) return null;
  return (
    <AppText variant="locationError" style={styles.message}>
      {picker.message}
    </AppText>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', backgroundColor: colors.modalBackdrop },
  paper: { backgroundColor: colors.surface, boxShadow: shadows.locationDialog, maxHeight: '90%' },
  // MUI Dialog: 32 px from the screen edges.
  paperCentered: { marginHorizontal: 32, borderRadius: 24 },
  paperNarrow: { marginHorizontal: 20 },
  paperChange: { borderRadius: 24 },
  paperSheet: { marginHorizontal: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderRadius: 0, maxHeight: '70%' },
  close: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.closeButtonBg,
  },
  welcomeTitle: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 8, paddingRight: 64 },
  // MUI removes DialogContent's top padding when it follows a DialogTitle.
  welcomeContent: { paddingHorizontal: 24, paddingTop: 0, paddingBottom: 24 },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.welcomeInfoBg,
  },
  welcomeColumn: { gap: 10 },
  welcomeButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.welcomeGreen,
    boxShadow: shadows.welcomeButton,
  },
  startIcon: { marginRight: 8, marginLeft: -4 },
  changeTitle: { paddingHorizontal: 24, paddingVertical: 16, paddingRight: 64 },
  changeContent: { paddingHorizontal: 24, paddingBottom: 20, gap: 16 },
  changeColumn: { alignItems: 'stretch', gap: 12 },
  successButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: colors.muiSuccess,
    boxShadow: shadows.muiElevation2,
  },
  input: { paddingHorizontal: 14, paddingVertical: 0, backgroundColor: colors.surface },
  results: { maxHeight: 180, marginTop: 4, borderWidth: 1, borderColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  resultItem: { paddingHorizontal: 16, paddingVertical: 4 },
  resultPressed: { backgroundColor: colors.thumbBg },
  selecting: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  message: { marginTop: 12 },
  divider: { height: 1, backgroundColor: colors.border },
  savedHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', columnGap: 8, rowGap: 2 },
  savedTitle: { flexShrink: 0 },
  // The 5 px side padding is pulled back so the label's text lines up with the card's 24 px edge.
  addNew: { paddingVertical: 4, paddingHorizontal: 5, marginHorizontal: -5, flexShrink: 0 },
  savedList: { gap: 8 },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 9.6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.savedAddressBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.savedAddress,
  },
  savedIcon: { minWidth: 36, marginTop: 1.6 },
  savedName: { fontFamily: interFamily(600), lineHeight: 20.8, marginBottom: 2 },
  flex: { flex: 1 },
  mt8: { marginTop: 8 },
  pressed: { opacity: 0.9 },
});
