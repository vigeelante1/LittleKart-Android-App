import { useEffect, useState } from 'react';

/** Time between words, and the longest a whole answer may take to type out. */
const WORD_MS = 45;
const MAX_MS = 1600;

/**
 * Types `text` out word by word, like a chat assistant (D-102). Off: the whole text at once.
 * Calls `onDone` once the last word is shown.
 */
export function useTypewriter(text: string, on: boolean, onDone?: () => void): { shown: string; typing: boolean } {
  const words = text.split(/(\s+)/);
  const total = words.length;
  // Long answers take bigger steps, so no answer takes more than MAX_MS.
  const step = Math.max(1, Math.ceil((total * WORD_MS) / MAX_MS));
  const duration = Math.ceil(total / step) * WORD_MS;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!on) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const ms = Date.now() - start;
      setElapsed(ms);
      if (ms >= duration) clearInterval(timer);
    }, WORD_MS);
    return () => clearInterval(timer);
  }, [text, on, duration]);

  const count = on ? Math.min(total, Math.floor(elapsed / WORD_MS) * step) : total;
  const done = count >= total;
  useEffect(() => {
    if (on && done) onDone?.();
    // onDone is called once per finished answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, done]);

  return { shown: done ? text : words.slice(0, count).join(''), typing: on && !done };
}
