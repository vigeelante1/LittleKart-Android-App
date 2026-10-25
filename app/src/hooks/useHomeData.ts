import { useEffect, useState } from 'react';
import { repos, type HomeData } from '@/services';
import { useProductStore } from '@/store/productStore';

/** Categories, sections, banners and deals for Home. Deals also go into the product cache. */
export function useHomeData(): { data: HomeData | null; error: boolean } {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState(false);
  const upsert = useProductStore((s) => s.upsert);

  useEffect(() => {
    let active = true;
    repos.catalog
      .getHome()
      .then((home) => {
        if (!active) return;
        upsert(home.deals);
        setData(home);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [upsert]);

  return { data, error };
}
