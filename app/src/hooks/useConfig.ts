import type { AppConfig } from '@littlekart/shared';
import { useEffect, useState } from 'react';
import { config as fallbackConfig } from '@/data/mock/other';
import { repos } from '@/services';

let cached: AppConfig | null = null;

/** App settings (fees, tip options, delivery-time profiles, search words). Loaded once per launch. */
export function useConfig(): AppConfig {
  const [config, setConfig] = useState<AppConfig>(cached ?? fallbackConfig);
  useEffect(() => {
    if (cached) return;
    let active = true;
    repos.config
      .get()
      .then((c) => {
        cached = c;
        if (active) setConfig(c);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return config;
}
