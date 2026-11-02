import { MAX_UNITS_PER_PRODUCT, type AiMessage, type AiReply, type Id } from '@littlekart/shared';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { repos } from '@/services';
import { useAuthStore, useCartStore } from '@/store';
import { useProductStore } from '@/store/productStore';
import { useAskAiStore, type AiLine, type AiList } from './askAiStore';

/** Turns a reply into the tickable list: ingredients ticked, "goes well with" never ticked by default. */
export function listFromReply(
  reply: AiReply,
  unticked: readonly Id[],
  quantities: Readonly<Record<Id, { variantId: Id; qty: number }>> = {},
): AiList {
  const qty = (i: AiReply['items'][number]) => (quantities[i.productId]?.variantId === i.variantId ? (quantities[i.productId]?.qty ?? i.qty) : i.qty);
  return {
    lines: [
      ...reply.items.map((i) => ({ ...i, qty: qty(i), extra: false, selected: !unticked.includes(i.productId) })),
      ...reply.extras.map((i) => ({ ...i, extra: true, selected: false })),
    ],
  };
}

/** The Ask AI chat: sending, the list's tick boxes and quantities, and adding the ticked items to the cart. */
export function useAskAi() {
  const state = useAskAiStore();
  const upsert = useProductStore((s) => s.upsert);

  const ask = useCallback(
    async (messages: AiMessage[]) => {
      const store = useAskAiStore.getState();
      store.set({ messages, busy: true, failed: false, stage: 'idle' });
      try {
        const reply = await repos.ai.chat(messages);
        const ids = [...reply.items, ...reply.extras].map((i) => i.productId);
        const known = useProductStore.getState().byId;
        const missing = ids.filter((id) => !known[id]);
        if (missing.length) upsert(await repos.catalog.getProductsByIds(missing));
        const now = useAskAiStore.getState();
        const hasList = reply.items.length > 0 || reply.extras.length > 0;
        now.set({
          busy: false,
          stage: 'typing',
          messages: [...messages, { role: 'assistant', text: reply.text, items: reply.items, extras: reply.extras }],
          list: hasList ? listFromReply(reply, now.unticked, now.quantities) : now.list,
        });
      } catch {
        useAskAiStore.getState().set({ busy: false, failed: true });
      }
    },
    [upsert],
  );

  const send = useCallback(
    (text: string) => {
      const t = text.trim();
      const { busy, messages } = useAskAiStore.getState();
      if (!t || busy) return;
      void ask([...messages, { role: 'user', text: t }]);
    },
    [ask],
  );

  const retry = useCallback(() => void ask(useAskAiStore.getState().messages), [ask]);

  const updateLine = useCallback((productId: Id, change: (l: AiLine) => AiLine) => {
    const { list, unticked, set } = useAskAiStore.getState();
    if (!list) return;
    const lines = list.lines.map((l) => (l.productId === productId ? change(l) : l));
    const line = lines.find((l) => l.productId === productId);
    set({
      list: { ...list, lines },
      unticked: line && !line.extra ? (line.selected ? unticked.filter((id) => id !== productId) : [...unticked, productId]) : unticked,
    });
  }, []);

  const toggle = useCallback((productId: Id) => updateLine(productId, (l) => ({ ...l, selected: !l.selected })), [updateLine]);

  const changeQty = useCallback(
    (productId: Id, delta: number) =>
      updateLine(productId, (l) => {
        const stock = useProductStore.getState().byId[productId]?.variants.find((v) => v.id === l.variantId)?.stock ?? 1;
        const qty = Math.max(1, Math.min(l.qty + delta, stock, MAX_UNITS_PER_PRODUCT));
        const { quantities, set } = useAskAiStore.getState();
        set({ quantities: { ...quantities, [productId]: { variantId: l.variantId, qty } } });
        return { ...l, qty, selected: true };
      }),
    [updateLine],
  );

  /** Adds the ticked lines, then opens the cart; a guest logs in first and lands on the cart after. */
  const addToCart = useCallback(() => {
    const { list } = useAskAiStore.getState();
    if (!list) return;
    const byId = useProductStore.getState().byId;
    const { increment } = useCartStore.getState();
    for (const l of list.lines) {
      if (!l.selected) continue;
      const stock = byId[l.productId]?.variants.find((v) => v.id === l.variantId)?.stock ?? 0;
      for (let n = 0; n < l.qty; n++) if (!increment(l.productId, l.variantId, stock)) break;
    }
    const store = useAskAiStore.getState();
    store.reset();
    store.setOpen(false);
    router.push('/cart');
    if (!useAuthStore.getState().user) router.push('/login');
  }, []);

  const selectedCount = state.list?.lines.filter((l) => l.selected).length ?? 0;
  return { ...state, send, retry, toggle, changeQty, addToCart, selectedCount };
}
