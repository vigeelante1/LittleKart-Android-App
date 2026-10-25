import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { BackPill } from '@/components/BackPill';
import { MyOrdersList } from '@/features/orders/MyOrdersList';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';
import { strings } from '@/strings';

/** My Orders on its own page (littlekart.com /orders, reached from an order's details). */
export default function OrdersScreen() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Redirect href="/login" />;
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <BackPill onPress={() => router.navigate('/')} />
          <AppText variant="muiH6Bold">{strings.orders.title}</AppText>
        </View>
        <MyOrdersList embedded={false} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  page: { marginHorizontal: 12, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 16 },
});
