import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

/** Row (or column, when `stacked`) of DialogButtons across the full card width. */
export function DialogActions({ children, stacked }: { children: ReactNode; stacked?: boolean }) {
  return <View style={[styles.row, stacked && styles.stacked]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { alignSelf: 'stretch', flexDirection: 'row', gap: 12, marginTop: 24 },
  stacked: { flexDirection: 'column', gap: 10 },
});
