import { useEffect, useState } from 'react';
import { repos, type NearestStore } from '@/services';
import { useLocationStore } from '@/store';

/**
 * The store serving the selected delivery location. `loading` is true while it is being looked up;
 * `nearest` is null without a location (or when the lookup failed).
 */
export function useNearestStore(): { nearest: NearestStore | null; loading: boolean } {
  const location = useLocationStore((s) => s.selected);
  /** The last lookup, tagged with the location it was made for. */
  const [result, setResult] = useState<{ key: string; nearest: NearestStore | null } | null>(null);

  const key = location ? `${location.lat},${location.lng}` : null;
  useEffect(() => {
    if (!location || key === null) return;
    let active = true;
    repos.stores
      .nearest(location.lat, location.lng)
      .then((nearest) => {
        if (active) setResult({ key, nearest });
      })
      .catch(() => {
        if (active) setResult({ key, nearest: null });
      });
    return () => {
      active = false;
    };
  }, [key, location]);

  const current = key !== null && result?.key === key;
  return { nearest: current ? result.nearest : null, loading: key !== null && !current };
}
