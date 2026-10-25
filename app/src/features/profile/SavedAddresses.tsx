import { MaterialIcons } from '@expo/vector-icons';
import type { Address } from '@littlekart/shared';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { AddressLabelIcon } from '@/components/icons/AddressIcons';
import { repos } from '@/services';
import { colors, hairline, shadows, type ColorToken } from '@/theme';
import { strings } from '@/strings';

type Kind = 'Home' | 'Work' | 'Hotel' | 'Other';

const TONES: Record<Kind, { bg: ColorToken; fg: ColorToken }> = {
  Home: { bg: 'toneOrangeBg', fg: 'toneOrange' },
  Work: { bg: 'toneBlueBg', fg: 'toneBlue' },
  Hotel: { bg: 'toneVioletBg', fg: 'toneViolet' },
  Other: { bg: 'toneTealBg', fg: 'toneTeal' },
};

const kindOf = (label: string): Kind => {
  const l = label.trim().toLowerCase();
  return l === 'home' ? 'Home' : l === 'work' ? 'Work' : l === 'hotel' ? 'Hotel' : 'Other';
};

/** Profile → Saved Addresses (littlekart.com): "+ Add New Address", then one card per address with edit and delete. */
export function SavedAddresses() {
  const [list, setList] = useState<Address[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    let active = true;
    repos.address
      .list()
      .then((l) => {
        if (!active) return;
        setList(l);
        setError('');
      })
      .catch(() => active && setError(strings.address.loadFailed));
    return () => {
      active = false;
    };
  }, []);

  // Reloads when coming back from Add / Edit Address.
  useFocusEffect(load);

  const remove = (id: string) => {
    repos.address
      .remove(id)
      .then(load)
      .catch(() => setError(strings.address.deleteFailed));
  };

  return (
    <View>
      <Pressable
        onPress={() => router.push('/add-address')}
        accessibilityRole="button"
        style={styles.addWrap}
      >
        <LinearGradient colors={colors.addAddressGradient} style={styles.add}>
          <AppText variant="addAddress">{strings.address.addNew}</AppText>
        </LinearGradient>
      </Pressable>

      {error ? (
        <AppText variant="bodyMuted" color="error" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      {list === null ? null : list.length === 0 ? (
        <AppText variant="bodyMuted" color="textSlateMuted" style={styles.empty}>
          {strings.address.none}
        </AppText>
      ) : (
        list.map((a) => {
          const kind = kindOf(a.label);
          const tone = TONES[kind];
          return (
            <View key={a.id} style={styles.card}>
              <View style={styles.meta}>
                <View style={[styles.icon, { backgroundColor: colors[tone.bg] }]}>
                  {kind === 'Home' ? (
                    <MaterialIcons name="home" size={20} color={colors[tone.fg]} />
                  ) : (
                    <AddressLabelIcon name={kind} size={20} color={colors[tone.fg]} />
                  )}
                </View>
                <View style={styles.flex}>
                  <AppText variant="addressTitle">{strings.address.titleLine(a.name, a.label)}</AppText>
                  <AppText variant="addressDetails" style={styles.details}>
                    {a.text}
                  </AppText>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => router.push({ pathname: '/add-address', params: { id: a.id } })}
                  accessibilityRole="button"
                  accessibilityLabel={strings.address.edit}
                  style={[styles.action, styles.edit]}
                >
                  <MaterialIcons name="edit" size={20} color={colors.toneBlue} />
                </Pressable>
                <Pressable
                  onPress={() => remove(a.id)}
                  accessibilityRole="button"
                  accessibilityLabel={strings.address.remove}
                  style={[styles.action, styles.delete]}
                >
                  <MaterialIcons name="delete" size={20} color={colors.error} />
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addWrap: { marginTop: 16, marginHorizontal: 12, marginBottom: 14, borderRadius: 12, boxShadow: shadows.addAddress },
  add: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.addAddressBorder,
  },
  error: { marginBottom: 16, paddingHorizontal: 12 },
  empty: { paddingHorizontal: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadows.soft,
  },
  meta: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, minWidth: 0 },
  details: { marginTop: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  action: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  edit: { backgroundColor: colors.toneBlueBg },
  delete: { backgroundColor: colors.logoutPressed },
});
