import type { Coupon } from '@littlekart/shared';
import { useEffect, useState } from 'react';
import { repos } from '@/services';

/** Coupons for a signed-in user (null while loading). Guests never see coupons on the live cart. */
export function useCoupons(signedIn: boolean): { coupons: Coupon[] | null; failed: boolean } {
  const [state, setState] = useState<{ coupons: Coupon[] | null; failed: boolean }>({ coupons: null, failed: false });

  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    repos.coupons
      .list()
      .then((coupons) => active && setState({ coupons, failed: false }))
      .catch(() => active && setState({ coupons: [], failed: true }));
    return () => {
      active = false;
    };
  }, [signedIn]);

  return signedIn ? state : { coupons: null, failed: false };
}
