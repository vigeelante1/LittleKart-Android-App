import { Redirect, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';
import { strings } from '@/strings';
import { OrderDetails } from './OrderDetails';
import { useOrder } from './useOrders';

/** Loads the order in the URL and shows its details, optionally under the profile header. */
export function OrderDetailsScreen({ embedded, header }: { embedded: boolean; header?: ReactNode }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const order = useOrder(id);
  if (!user) return <Redirect href="/login" />;
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.page}>
        {header}
        <ScrollView contentContainerStyle={embedded ? styles.embedded : styles.plain} showsVerticalScrollIndicator={false}>
          {order === undefined ? (
            <ActivityIndicator color={colors.primary} style={styles.loading} />
          ) : order === null ? (
            <AppText variant="muiBody1" color="error" align="center" style={styles.loading}>
              {strings.orders.notFound}
            </AppText>
          ) : (
            <OrderDetails order={order} embedded={embedded} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  page: { flex: 1, marginHorizontal: 12 },
  embedded: { paddingHorizontal: 12, paddingBottom: 20 },
  plain: { paddingBottom: 24 },
  loading: { marginTop: 48 },
});
