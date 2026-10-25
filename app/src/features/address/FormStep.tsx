import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { AddressLabelIcon, type AddressIconName } from '@/components/icons/AddressIcons';
import { LabeledInput } from '@/components/LabeledInput';
import { colors, hairline, interFamily, shadows } from '@/theme';
import { strings } from '@/strings';
import type { AddressEditor } from './useAddressEditor';

const PRESETS: { label: 'Home' | 'Work' | 'Hotel'; text: string }[] = [
  { label: 'Home', text: strings.address.home },
  { label: 'Work', text: strings.address.work },
  { label: 'Hotel', text: strings.address.hotel },
];

interface Props {
  editor: AddressEditor;
  editing: boolean;
  onCancel: () => void;
}

/** Step 2 of Add New Address on a phone: the form, full screen (littlekart.com address modal). */
export function FormStep({ editor, editing, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const { form, errors } = editor;

  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior="padding">
      <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <AppText variant="formTitle">{editing ? strings.address.editTitle : strings.address.title}</AppText>
          <Pressable
            onPress={editor.backToMap}
            accessibilityRole="button"
            accessibilityLabel={strings.address.backToMap}
            style={styles.close}
          >
            <MaterialIcons name="close" size={24} color={colors.iconMuted} />
          </Pressable>
        </View>

        <AppText variant="muiCaption" style={styles.saveAs}>
          {strings.address.saveAs}
        </AppText>
        {editor.saveError ? (
          <View style={styles.alert}>
            <MaterialIcons name="error-outline" size={22} color={colors.error} style={styles.alertIcon} />
            <AppText variant="alertError" style={styles.flex}>
              {editor.saveError}
            </AppText>
          </View>
        ) : null}

        <View style={[styles.labels, errors.label ? styles.labelsError : null]}>
          {!form.customLabel
            ? PRESETS.map((p) => (
                <LabelTag
                  key={p.label}
                  icon={p.label}
                  text={p.text}
                  selected={form.label === p.label}
                  onPress={() => editor.pickPreset(p.label)}
                />
              ))
            : null}
          <LabelTag icon="Other" text={strings.address.other} selected={form.customLabel} onPress={editor.toggleOther} />
          {form.customLabel ? (
            <TextInput
              value={form.label}
              onChangeText={(label) => editor.update({ label })}
              placeholder={strings.address.customLabel}
              placeholderTextColor={colors.customTipPlaceholder}
              allowFontScaling={false}
              selectionColor={colors.brightGreen}
              style={styles.customLabel}
            />
          ) : null}
        </View>

        <View style={styles.addressBox}>
          <AppText variant="addressBox">{editor.text || (editor.locating ? strings.address.fetching : strings.address.noAddress)}</AppText>
        </View>

        <LabeledInput
          label={strings.address.house}
          value={form.houseNo}
          onChangeText={(houseNo) => editor.update({ houseNo })}
          error={errors.houseNo}
          containerStyle={styles.field}
        />
        <LabeledInput
          label={strings.address.landmark}
          value={form.landmark}
          onChangeText={(landmark) => editor.update({ landmark })}
          containerStyle={styles.field}
        />
        <LabeledInput
          label={strings.address.name}
          value={form.name}
          onChangeText={editor.setName}
          error={errors.name}
          autoCapitalize="words"
          containerStyle={styles.field}
        />
        <LabeledInput
          label={strings.address.phone}
          value={form.phone}
          onChangeText={editor.setPhone}
          error={errors.phone}
          keyboardType="phone-pad"
          containerStyle={styles.field}
        />
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: 10 + insets.bottom }]}>
        <Pressable onPress={onCancel} disabled={editor.saving} accessibilityRole="button" style={[styles.button, styles.cancel]}>
          <AppText variant="formButton">{strings.address.cancel}</AppText>
        </Pressable>
        <Pressable
          onPress={() => void editor.save()}
          disabled={editor.saving}
          accessibilityRole="button"
          style={[styles.button, styles.save]}
        >
          <AppText variant="formButton" color="white">
            {editor.saving ? strings.address.saving : editing ? strings.address.update : strings.address.save}
          </AppText>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function LabelTag({ icon, text, selected, onPress }: { icon: AddressIconName; text: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} style={[styles.tagShadow, selected && styles.tagShadowSelected]}>
      <LinearGradient
        colors={selected ? colors.labelTagSelectedGradient : colors.labelTagGradient}
        start={selected ? { x: 0, y: 0 } : { x: 0.5, y: 0 }}
        end={selected ? { x: 1, y: 1 } : { x: 0.5, y: 1 }}
        style={[styles.tag, selected && styles.tagSelected]}
      >
        <AddressLabelIcon name={icon} size={20} color={selected ? colors.white : colors.warning} />
        <AppText variant={selected ? 'labelTagSelected' : 'labelTag'}>{text}</AppText>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  content: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: -8 },
  saveAs: { marginBottom: 4 },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: colors.alertErrorBg,
  },
  alertIcon: { marginRight: 12, paddingVertical: 7 },
  labels: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 16 },
  labelsError: { borderWidth: hairline, borderColor: colors.cssRed, padding: 8, borderRadius: 8 },
  tagShadow: { borderRadius: 999, boxShadow: shadows.labelTag },
  tagShadowSelected: { boxShadow: shadows.labelTagSelected },
  tag: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: hairline,
    borderColor: colors.labelTagBorder,
  },
  tagSelected: { borderColor: 'transparent' },
  customLabel: {
    width: 140,
    height: 38,
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderRadius: 10,
    borderWidth: hairline,
    borderColor: colors.customTipBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.customTip,
    textAlign: 'center',
    fontFamily: interFamily(400),
    fontSize: 15,
    color: colors.black,
  },
  addressBox: {
    padding: 10,
    marginBottom: 16,
    borderRadius: 4,
    borderWidth: hairline,
    borderColor: colors.customTipBorder,
    backgroundColor: colors.addressBoxBg,
  },
  field: { marginBottom: 16 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
  cancel: { backgroundColor: colors.muiDisabledFill },
  save: { backgroundColor: colors.primary },
});
