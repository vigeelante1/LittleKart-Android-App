// Ask AI chat state (iteration 2, DECISIONS D-102). Kept while the app runs, so closing and reopening the
// chat keeps the conversation; not saved to the phone.
import type { AiItem, AiMessage, Id } from '@littlekart/shared';
import { create } from 'zustand';

export interface AiLine extends AiItem {
  selected: boolean;
  extra: boolean;
}

export interface AiList {
  lines: AiLine[];
}

/** How far the newest answer has appeared: its text types out, then its list slides in, then the Add button shows. */
export type RevealStage = 'idle' | 'typing' | 'listing';

interface AskAiState {
  open: boolean;
  stage: RevealStage;
  messages: AiMessage[];
  list: AiList | null;
  /** Products the shopper unticked; they stay unticked when the assistant sends an updated list. */
  unticked: Id[];
  /** Quantities the shopper changed (product → qty for that size); kept on an updated list too. */
  quantities: Record<Id, { variantId: Id; qty: number }>;
  busy: boolean;
  failed: boolean;
  setOpen: (open: boolean) => void;
  set: (patch: Partial<Omit<AskAiState, 'setOpen' | 'set' | 'reset'>>) => void;
  reset: () => void;
}

const empty = { messages: [], list: null, unticked: [], quantities: {}, busy: false, failed: false, stage: 'idle' as RevealStage };

export const useAskAiStore = create<AskAiState>()((set) => ({
  open: false,
  ...empty,
  // Closing mid-answer shows the answer in full next time.
  setOpen: (open) => set({ open, stage: 'idle' }),
  set: (patch) => set(patch),
  reset: () => set(empty),
}));
