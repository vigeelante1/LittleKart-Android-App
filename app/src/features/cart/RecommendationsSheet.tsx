import { MaterialIcons } from '@expo/vector-icons';
import type { Product } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { ProductGrid } from '@/features/listing/ProductGrid';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  visible: boolean;
  products: readonly Product[];
  onClose: () => void;
  onOpenOptions: (product: Product) => void;
}

/** "View more": every suggestion in a bottom sheet, 96 px short of the screen height (littlekart.com). */
export function RecommendationsSheet({ visible, products, onClose, onOpenOptions }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="none" />
      <View style={[styles.sheet, { height: height - 96 }]}>
        <View style={styles.handle} />
        <LinearGradient
          colors={colors.recSheetHeaderGradient}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <AppText variant="recTitle">{strings.cart.oftenBought}</AppText>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={strings.cart.closeRecommendations}
            style={styles.close}
          >
            <MaterialIcons name="close" size={24} color={colors.iconMuted} />
          </Pressable>
        </LinearGradient>
        <ScrollView style={styles.body} contentContainerStyle={[styles.bodyContent, { paddingBottom: 10 + insets.bottom }]}>
          <ProductGrid products={products} onOpenOptions={onOpenOptions} columns={3} layout="compact" />
        </ScrollView>
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
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: colors.recSheetHeaderBorder,
  },
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
  body: { flex: 1, backgroundColor: colors.recSheetBodyBg },
  bodyContent: { padding: 10 },
});
