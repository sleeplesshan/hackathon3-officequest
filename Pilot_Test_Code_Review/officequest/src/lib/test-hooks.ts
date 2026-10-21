import type { DB, UserId } from './types';

export interface HyperPayload { worker?: UserId; bounty?: number; fromLv?: number; toLv?: number; stars?: number }
export interface HyperOptions { freezeAtMs?: number }
export interface HyperRecord { variant: 'post' | 'clear'; openedAt: number; closedAt: number | null; frames: number }
export interface TeamsRecord { threadKey: string; sentAt: number; replyAt: number | null }
export interface OqTest {
  getDB: () => DB;
  reset: () => void;
  loadScenario: (name: 'seed' | 'ref07' | 'timerExpired' | 'limitApprove' | 'rejectLimit') => void;
  playHyperFrame: (variant: 'post' | 'clear', payload?: HyperPayload, options?: HyperOptions) => void;
  hyperframes: HyperRecord[];
  teams: TeamsRecord[];
  showTypingFor: (threadKey: string) => void;
}
export interface EditorApi { kind: 'tinymce' | 'fallback'; setContent: (html: string) => void; getContent: () => string }
declare global {
  interface Window {
    __OQ_TEST__?: OqTest;
    __OQ_EDITORS__?: Record<string, EditorApi>;
  }
}

export function playHyperFrame(variant: 'post' | 'clear', payload: HyperPayload = {}, onDone?: () => void, options?: HyperOptions) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('oq:hyperframe', { detail: { variant, payload, onDone, options } }));
}
