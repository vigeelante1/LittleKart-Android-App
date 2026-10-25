import { DELIVERY_STEPS, formatOrderTime, stepNumber, type Order } from '@littlekart/shared';
import { Fragment } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';

/** "Delivery status": Pending · Accepted · Assigned · Nearby · Delivered, and the time it was placed. */
export function DeliveryStatusCard({ order }: { order: Order }) {
  const current = stepNumber(order.status);
  return (
    <View style={styles.card}>
      <AppText variant="stepsTitle" style={styles.title}>
        {strings.tracking.deliveryStatus}
      </AppText>
      <AppText variant="stepsCaption" style={styles.caption}>
        {strings.tracking.swipeSteps}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.steps} style={styles.scroll}>
        {DELIVERY_STEPS.map((step, i) => {
          const done = current > step.id;
          const now = current === step.id;
          return (
            <Fragment key={step.id}>
              <View style={styles.step}>
                <View style={[styles.dot, done || now ? styles.dotOn : styles.dotOff, now && styles.dotNow]}>
                  <AppText variant="stepDot">{done ? '✓' : String(step.id)}</AppText>
                </View>
                <AppText
                  variant={now ? 'stepLabelCurrent' : done ? 'stepLabelDone' : 'stepLabel'}
                  align="center"
                  numberOfLines={2}
                  style={styles.label}
                >
                  {step.label}
                </AppText>
              </View>
              {i < DELIVERY_STEPS.length - 1 ? <View style={[styles.line, done ? styles.dotOn : styles.dotOff]} /> : null}
            </Fragment>
          );
        })}
      </ScrollView>
      <AppText variant="muiBody2Muted" style={styles.placed}>
        {strings.tracking.placedAt(formatOrderTime(order.createdAt))}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderFaint,
    backgroundColor: colors.surface,
    boxShadow: shadows.trackingCard,
  },
  title: { marginBottom: 12 },
  caption: { marginBottom: 8 },
  scroll: { paddingBottom: 10 },
  steps: { alignItems: 'flex-start', minHeight: 72, paddingRight: 8 },
  step: { width: 56, alignItems: 'center' },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: colors.primary },
  dotOff: { backgroundColor: colors.stepIdle },
  dotNow: { boxShadow: shadows.stepRing },
  label: { marginTop: 6, width: '100%', paddingHorizontal: 2 },
  line: { width: 12, height: 3, marginTop: 11, borderRadius: 999 },
  placed: { marginTop: 16 },
});
