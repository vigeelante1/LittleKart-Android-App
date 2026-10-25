import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { colors, hairline, interFamily, shadows } from '@/theme';
import { strings } from '@/strings';
import type { RefObject } from 'react';
import { MapView, type MapViewHandle } from './MapView';
import type { AddressEditor } from './useAddressEditor';

/** Step 1 of Add New Address on a phone: full-screen map, centre pin, search, current location, confirm panel. */
interface Props {
  editor: AddressEditor;
  mapRef: RefObject<MapViewHandle | null>;
  onClose: () => void;
}

export function MapStep({ editor, mapRef, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const status = editor.message || editor.text || (editor.locating ? strings.address.fetching : strings.address.noAddress);
  const statusIsMessage = !!editor.message;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.map}>
        <MapView ref={mapRef} initial={editor.initial} onMoveStart={editor.onMapMoveStart} onUserMove={editor.onMapMoved} />

        {/* The pin's tip marks the map centre; the label hides while the map is dragged. */}
        <View pointerEvents="none" style={styles.pinWrap}>
          {!editor.dragging ? (
            <View style={styles.pinLabel}>
              <AppText variant="pinLabel" numberOfLines={1}>
                {strings.address.pinTooltip}
              </AppText>
            </View>
          ) : null}
          <MaterialIcons name="room" size={35} color={colors.error} />
        </View>

        <View style={[styles.search, { top: 14 }]}>
          <TextInput
            value={editor.query}
            onChangeText={editor.changeQuery}
            placeholder={strings.address.searchMap}
            placeholderTextColor={colors.inputPlaceholder}
            allowFontScaling={false}
            autoCorrect={false}
            selectionColor={colors.brightGreen}
            style={styles.searchInput}
          />
          {editor.searching ? <AppText variant="muiCaption">{strings.location.searching}</AppText> : null}
          {editor.showList ? (
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {editor.suggestions.length > 0 ? (
                editor.suggestions.map((s, i) => (
                  <Pressable
                    key={`${s.text}-${i}`}
                    onPress={() => void editor.chooseSuggestion(s)}
                    style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                  >
                    <AppText variant="suggestionPrimary">{s.text}</AppText>
                  </Pressable>
                ))
              ) : (
                <View style={styles.item}>
                  <AppText variant="suggestionPrimary">
                    {editor.searched && !editor.searching ? strings.location.noResults : strings.location.searchingNearby}
                  </AppText>
                </View>
              )}
            </ScrollView>
          ) : null}
        </View>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={strings.address.close}
          style={[styles.close, { top: 14 }]}
        >
          <MaterialIcons name="close" size={20} color={colors.iconMuted} />
        </Pressable>

        <Pressable
          onPress={() => void editor.locateMe()}
          disabled={editor.locating}
          accessibilityRole="button"
          style={[styles.current, { bottom: insets.bottom + 208 }, editor.locating && styles.currentDisabled]}
        >
          <MaterialIcons name="my-location" size={20} color={editor.locating ? colors.disabledText : colors.primary} />
          <AppText variant="currentLocation" color={editor.locating ? 'disabledText' : 'primary'}>
            {editor.locating ? strings.address.fetching : strings.location.useCurrent}
          </AppText>
        </Pressable>

        <View style={[styles.panel, { bottom: insets.bottom + 20 }]}>
          <View style={styles.handle} />
          <View style={styles.card}>
            <AppText variant="mapPanelTitle">{strings.address.deliveringYourOrderTo}</AppText>
            <View style={styles.statusRow}>
              <MaterialIcons name="room" size={20} color={colors.error} style={styles.statusIcon} />
              <AppText variant="mapPanelAddress" color={statusIsMessage ? 'error' : 'text'} style={styles.flex} numberOfLines={4}>
                {status}
              </AppText>
            </View>
          </View>
          <Pressable
            onPress={editor.confirm}
            disabled={!editor.canConfirm}
            accessibilityRole="button"
            accessibilityState={{ disabled: !editor.canConfirm }}
            style={({ pressed }) => [styles.confirm, !editor.canConfirm && styles.confirmDisabled, pressed && styles.pressed]}
          >
            <AppText variant="confirmLocation" color={editor.canConfirm ? 'muiContainedText' : 'disabledText'}>
              {strings.address.confirm}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  map: { flex: 1, overflow: 'hidden' },
  pinWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: '50%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pinLabel: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.pinLabelBg,
    boxShadow: shadows.pinLabel,
  },
  search: { position: 'absolute', left: 12, right: 60 },
  searchInput: {
    height: 40,
    paddingHorizontal: 14,
    paddingVertical: 0,
    borderRadius: 4,
    borderWidth: hairline,
    borderColor: colors.inputOutline,
    fontFamily: interFamily(400),
    fontSize: 16,
    color: colors.text,
  },
  list: {
    maxHeight: 180,
    marginTop: 4,
    borderRadius: 4,
    borderWidth: hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  item: { paddingVertical: 4, paddingHorizontal: 16, minHeight: 36, justifyContent: 'center' },
  itemPressed: { backgroundColor: colors.thumbBg },
  close: {
    position: 'absolute',
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    boxShadow: shadows.mapClose,
  },
  current: {
    position: 'absolute',
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 4,
    borderWidth: hairline,
    borderColor: colors.muiPrimaryOutline,
    backgroundColor: colors.currentLocationBg,
    boxShadow: shadows.currentLocation,
  },
  currentDisabled: { borderColor: colors.muiDisabledBg },
  panel: {
    position: 'absolute',
    left: 12,
    right: 12,
    gap: 10,
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderRadius: 24,
    backgroundColor: colors.mapPanelBg,
    boxShadow: shadows.mapPanel,
  },
  handle: { width: 42, height: 5, marginBottom: 2, alignSelf: 'center', borderRadius: 999, backgroundColor: colors.mapHandle },
  card: { paddingTop: 4, maxHeight: 110 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusIcon: { marginRight: 4 },
  flex: { flex: 1 },
  confirm: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.warning,
    boxShadow: shadows.confirmLocation,
  },
  confirmDisabled: { backgroundColor: colors.muiDisabledBg, boxShadow: shadows.none },
  pressed: { opacity: 0.9 },
});
