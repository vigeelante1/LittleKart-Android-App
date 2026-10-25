import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileHeader } from '@/features/profile/ProfileHeader';
import { menuItem } from '@/features/profile/menu';
import { SavedAddresses } from '@/features/profile/SavedAddresses';
import { MyOrdersList } from '@/features/orders/MyOrdersList';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';
import { useDock } from '@/features/dock/useDock';

/**
 * A profile section (/profile/orders, /profile/help, ...): the same header with the row's name as title.
 * Saved Addresses (M7) and Orders (M9) are built; the others are listed in FIDELITY_NOTES.
 */
export default function ProfileSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const user = useAuthStore((s) => s.user);
  const item = menuItem(section);
  const dockSpace = useDock().space;
  if (!user) return <Redirect href="/login" />;
  if (!item) return <Redirect href="/profile" />;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.page}>
        <ProfileHeader
          title={item.label}
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/profile'))}
        />
        <ScrollView contentContainerStyle={[styles.body, { paddingBottom: 20 + dockSpace }]}>{item.path === 'saved-addresses' ? <SavedAddresses /> : item.path === 'orders' ? <MyOrdersList embedded /> : null}</ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  page: { flex: 1, marginHorizontal: 12 },
  // The site's section body: padding 0 12 20.
  body: { paddingHorizontal: 12, paddingBottom: 20 },
});
