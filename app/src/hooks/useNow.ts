import { useEffect, useState } from 'react';

/** The current time, refreshed every `everyMs` (the site recounts "Arriving in" every 15 s). */
export function useNow(everyMs = 15_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(timer);
  }, [everyMs]);
  return now;
}
