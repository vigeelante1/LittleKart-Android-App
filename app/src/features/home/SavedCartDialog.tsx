import { StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogActions } from '@/components/dialog/DialogActions';
import { DialogBadge } from '@/components/dialog/DialogBadge';
import { DialogButton } from '@/components/dialog/DialogButton';
import { DialogShell } from '@/components/dialog/DialogShell';
import { strings } from '@/strings';

interface Props {
  visible: boolean;
  count: number;
  clearing: boolean;
  /** "Goto Cart", the X and a tap outside all open the cart, as on the live site. */
  onGotoCart: () => void;
  onClear: () => void;
}

/** "You have a saved existing cart" after signing in (iteration-2 pop-up design, D-83). */
export function SavedCartDialog({ visible, count, clearing, onGotoCart, onClear }: Props) {
  return (
    <DialogShell visible={visible} onClose={onGotoCart}>
      <DialogBadge icon="shopping-cart" tone="success" count={count} />
      <AppText variant="savedCartTitle" align="center" style={styles.title}>
        {strings.savedCart.title}
      </AppText>
      <AppText variant="savedCartBody" align="center">
        {strings.savedCart.body(count)}
      </AppText>
      <DialogActions>
        <DialogButton
          kind="danger"
          icon="delete-outline"
          label={clearing ? strings.savedCart.clearing : strings.savedCart.clear}
          loading={clearing}
          onPress={onClear}
        />
        <DialogButton kind="primary" icon="shopping-cart" label={strings.savedCart.goto} onPress={onGotoCart} />
      </DialogActions>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 6 },
});
