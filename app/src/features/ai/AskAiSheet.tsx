import { MaterialIcons } from '@expo/vector-icons';
import { formatRupee } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { useProductStore } from '@/store/productStore';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';
import { AiBubble } from './AiBubble';
import { AiComposer } from './AiComposer';
import { AiListCard } from './AiListCard';
import { useAskAi } from './useAskAi';

/** The Ask AI chat, a bottom sheet like "View more" (D-102). Nothing reaches the cart until the button is pressed. */
export function AskAiSheet() {
  const ai = useAskAi();
  const products = useProductStore((s) => s.byId);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const close = () => ai.setOpen(false);

  useEffect(() => {
    if (ai.open) setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
  }, [ai.open, ai.messages.length, ai.busy, ai.failed]);

  const lastAssistant = ai.messages.map((m) => m.role).lastIndexOf('assistant');
  const total =
    ai.list?.lines.reduce((sum, l) => {
      const v = products[l.productId]?.variants.find((x) => x.id === l.variantId);
      return l.selected && v ? sum + v.price * l.qty : sum;
    }, 0) ?? 0;

  return (
    <Modal visible={ai.open} transparent animationType="slide" statusBarTranslucent onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityRole="none" />
      <KeyboardAvoidingView behavior="padding" style={styles.avoid} pointerEvents="box-none">
        <View style={[styles.sheet, { height: height - 64 }]}>
          <View style={styles.handle} />
          <LinearGradient colors={colors.recSheetHeaderGradient} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <View style={styles.badge}>
              <MaterialIcons name="auto-awesome" size={20} color={colors.white} />
            </View>
            <View style={styles.headText}>
              <AppText variant="aiTitle">{strings.ai.title}</AppText>
              <AppText variant="aiSubtitle">{strings.ai.subtitle}</AppText>
            </View>
            {ai.messages.length ? (
              <Pressable onPress={ai.reset} accessibilityRole="button" accessibilityLabel={strings.ai.newChat} style={styles.round}>
                <MaterialIcons name="refresh" size={22} color={colors.iconMuted} />
              </Pressable>
            ) : null}
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={strings.ai.close} style={styles.round}>
              <MaterialIcons name="close" size={24} color={colors.iconMuted} />
            </Pressable>
          </LinearGradient>

          <ScrollView
            ref={scroll}
            onContentSizeChange={() => (ai.stage !== 'idle' || ai.busy) && scroll.current?.scrollToEnd({ animated: true })}
            style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
            <AiBubble role="assistant" text={strings.ai.greeting} sub={strings.ai.greetingTe} />
            {ai.messages.length === 0 ? (
              <View style={styles.chips}>
                {strings.ai.quick.map((q) => (
                  <Pressable key={q} onPress={() => ai.send(q)} accessibilityRole="button" style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
                    <AppText variant="aiChip">{q}</AppText>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {ai.messages.map((m, i) => {
              const newest = i === lastAssistant && i === ai.messages.length - 1;
              return (
                <View key={i} style={styles.turn}>
                  <AiBubble
                    role={m.role}
                    text={m.text}
                    animate={newest && ai.stage === 'typing'}
                    onTyped={() => ai.set({ stage: ai.list && m.items?.length ? 'listing' : 'idle' })}
                  />
                  {i === lastAssistant && ai.list && !(newest && ai.stage === 'typing') ? (
                    <AiListCard
                      list={ai.list}
                      products={products}
                      onToggle={ai.toggle}
                      onQty={ai.changeQty}
                      animate={newest && ai.stage === 'listing'}
                      onShown={() => ai.set({ stage: 'idle' })}
                    />
                  ) : null}
                </View>
              );
            })}
            {ai.busy ? (
              <View style={styles.thinking}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText variant="aiMessageMuted">{strings.ai.thinking}</AppText>
              </View>
            ) : null}
            {ai.failed ? (
              <View style={styles.failed}>
                <AppText variant="aiMessageMuted">{strings.ai.error}</AppText>
                <Pressable onPress={ai.retry} accessibilityRole="button" style={styles.chip}>
                  <AppText variant="aiChip">{strings.ai.retry}</AppText>
                </Pressable>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: 10 + insets.bottom }]}>
            {ai.list?.lines.length && ai.stage === 'idle' ? (
              <Pressable
                onPress={ai.addToCart}
                disabled={ai.selectedCount === 0}
                accessibilityRole="button"
                style={({ pressed }) => [styles.add, ai.selectedCount === 0 && styles.addOff, pressed && styles.addPressed]}
              >
                <MaterialIcons name="shopping-cart" size={20} color={colors.white} />
                <AppText variant="aiButton">{ai.selectedCount ? strings.ai.addToCart(ai.selectedCount) : strings.ai.nothingSelected}</AppText>
                {ai.selectedCount ? <AppText variant="aiButton">· {formatRupee(total)}</AppText> : null}
              </Pressable>
            ) : null}
            <AiComposer busy={ai.busy} onSend={ai.send} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.dialogBackdrop },
  avoid: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
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
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: colors.recSheetHeaderBorder,
  },
  badge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  headText: { flex: 1, minWidth: 0 },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: hairline,
    borderColor: colors.closeButtonBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.closeButton,
  },
  body: { flex: 1, backgroundColor: colors.recSheetBodyBg },
  bodyContent: { padding: 12, gap: 10 },
  turn: { gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: hairline,
    borderColor: colors.seeAllBorder,
    backgroundColor: colors.primaryLight,
  },
  chipPressed: { opacity: 0.7 },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  failed: { gap: 8, alignItems: 'flex-start' },
  footer: { gap: 10, paddingTop: 10, paddingHorizontal: 12, borderTopWidth: hairline, borderTopColor: colors.sheetDivider, backgroundColor: colors.surface },
  add: { height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary },
  addOff: { backgroundColor: colors.muiDisabledFill },
  addPressed: { backgroundColor: colors.primaryDark },
});
