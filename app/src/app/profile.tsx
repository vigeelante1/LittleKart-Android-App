import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { Linking, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { ProfileHeader } from '@/features/profile/ProfileHeader';
import { ProfileMenu } from '@/features/profile/ProfileMenu';
import { ACCOUNT_ITEMS, APP_LINKS, MORE_ITEMS, type ProfileMenuItem } from '@/features/profile/menu';
import { repos } from '@/services';
import { useAuthStore, useTrackingStore } from '@/store';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

/** Profile (littlekart.com /profile, phone layout; DESIGN_SPEC S15). */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const clearTracking = useTrackingStore((s) => s.setActive);

  // The site sends signed-out visitors to Login.
  if (!user) return <Redirect href="/login" />;

  const open = (item: ProfileMenuItem) => {
    if (item.path === 'share') {
      void Share.share({
        title: strings.profile.shareTitle,
        message: strings.profile.shareText(APP_LINKS.android, APP_LINKS.ios, APP_LINKS.web),
      }).catch(() => undefined);
      return;
    }
    if (item.path === 'rate-app') {
      void Linking.openURL(APP_LINKS.android).catch(() => undefined);
      return;
    }
    router.push({ pathname: '/profile/[section]', params: { section: item.path } });
  };

  const logout = () => {
    void repos.auth.logout().catch(() => undefined);
    signOut();
    clearTracking(null);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.page}>
        <ProfileHeader title={strings.profile.title} onBack={() => router.navigate('/')} />
        <ScrollView contentContainerStyle={{ paddingBottom: 8 + insets.bottom }} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={colors.profileHeroGradient}
            locations={[0, 0.45, 1]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.avatar}>
              <MaterialIcons name="account-circle" size={34} color={colors.avatarIcon} />
            </View>
            <View style={styles.flex}>
              <AppText variant="profileName">{user.name || strings.profile.user}</AppText>
              <AppText variant="profilePhone" style={styles.phone}>
                {strings.profile.phone(user.phone)}
              </AppText>
            </View>
          </LinearGradient>

          <ProfileMenu label={strings.profile.account} items={ACCOUNT_ITEMS} onPress={open} />
          <ProfileMenu label={strings.profile.more} items={MORE_ITEMS} onPress={open} />

          <Pressable
            onPress={logout}
            accessibilityRole="button"
            style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
          >
            <MaterialIcons name="logout" size={20} color={colors.error} />
            <AppText variant="logout">{strings.profile.logout}</AppText>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  // Inside the site's 12 px page container, like the other screens.
  page: { flex: 1, marginHorizontal: 12 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
    marginHorizontal: 12,
    marginBottom: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: hairline,
    borderColor: colors.profileHeroBorder,
    boxShadow: shadows.profileHero,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.avatarBorder,
    backgroundColor: colors.avatarBg,
  },
  flex: { flex: 1, minWidth: 0 },
  phone: { marginTop: 4 },
  logout: {
    minHeight: 46,
    marginTop: 4,
    marginHorizontal: 12,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.logoutBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.soft,
  },
  logoutPressed: { backgroundColor: colors.logoutPressed },
});
