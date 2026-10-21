'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { DomainError, type Action, type DB, type PersonaId, type User, type UserId } from '@/lib/types';
import { applyAction, activatePersona, ensureDay, ensureThread } from './reducer';
import { getSeed } from './seed';
import { loadScenario } from './scenarios';
import { now as clockNow } from '@/lib/clock';
import { playHyperFrame } from '@/lib/test-hooks';
import { playSound } from '@/lib/audio';
import { showReward } from '@/components/feedback/RewardFeedback';
import { readStored, saveStored } from './persistence';

interface DbContextValue {
  db: DB | null; user: User | null; personaId: PersonaId; theme: 'light' | 'dark'; now: number;
  dispatch: (action: Action, actor?: UserId, silent?: boolean) => DB | null;
  setPersona: (id: PersonaId) => void; toggleTheme: () => void;
  reset: () => void; replaceDb: (db: DB) => void;
  openThread: (context: 'handover' | 'market', refId: string, other: UserId) => string;
  toast: (text: string, kind?: 'success' | 'danger' | 'info') => void;
}
const DbContext = createContext<DbContextValue | null>(null);
export function useDb() { const value = useContext(DbContext); if (!value) throw new Error('DbProvider is required'); return value; }

export function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB | null>(null);
  const [personaId, setPersonaId] = useState<PersonaId>('kim');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState<{ text: string; kind: string } | null>(null);
  const current = useRef<DB | null>(null);
  const actor = useRef<PersonaId>('kim');
  const rev = useRef(0);
  const channel = useRef<BroadcastChannel | null>(null);
  const notified=useRef(new Set<string>());
  const noticeKind=useRef<string|null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const toast = useCallback((text: string, kind = 'success') => {
    if(kind==='info'&&noticeKind.current==='danger')return;
    noticeKind.current=kind;
    setNotice({ text, kind });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => {noticeKind.current=null;setNotice(null);}, 4000);
  }, []);

  const commit = useCallback((next: DB) => {
    // Save first: a storage failure leaves both the visible state and DB unchanged.
    const latestRev = readStored(window.localStorage)?.rev ?? 0;
    const revision = Math.max(clockNow() * 1000, rev.current + 1, latestRev + 1);
    try { saveStored(window.localStorage, next, revision); }
    catch { toast('사진 용량이 커서 저장하지 못했어요', 'danger'); return false; }
    rev.current = revision; current.current = next; setDb(next);
    channel.current?.postMessage({ type: 'db', rev: revision });
    window.dispatchEvent(new CustomEvent('oq:db', { detail: { rev: revision } }));
    return true;
  }, [toast]);

  const dispatch = useCallback((action: Action, acting?: UserId, silent = false) => {
    if (!current.current) return null;
    try {
      const latest = readStored(window.localStorage);
      if (latest && latest.rev > rev.current) { current.current = latest; rev.current = latest.rev; }
      const next = activatePersona(applyAction(current.current, action, acting ?? actor.current, clockNow()), actor.current, clockNow());
      if(!commit(next))return null;
      if(action.type==='daily/claim'){playSound('coin');showReward({kind:'daily',title:'일일 보상 획득!',detail:'+10 P · +50 EXP'});}
      else if(action.type==='quest/approve'||action.type==='quest/acceptAnswer')playSound('quest');
      else if(action.type==='item/confirmReceipt'){playSound('trade');showReward({kind:'trade',title:'거래 완료!',detail:'물품 수령 확인 · 포인트 정산 완료'});}
      else if(action.type==='item/undoReceipt'){playSound('undo');showReward({kind:'undo',title:'거래 완료 취소',detail:'포인트를 원래대로 돌려드렸어요'});}
      else if(action.type==='character/equip'||action.type==='quest/create'||action.type==='quest/answer'||action.type==='quest/adopt'||action.type==='quest/submit'||action.type==='item/sellTo'||action.type==='item/create')playSound('success');
      else if(action.type==='teams/send'||action.type==='teams/reply')playSound('message');
      else if(action.type==='item/like')playSound('like');
      return next;
    } catch (error) {
      if(!silent)playSound('warning');
      if (!silent || !(error instanceof DomainError) || error.code !== 'INVALID_STATE') toast(error instanceof Error ? error.message : '처리하지 못했어요', 'danger');
      return null;
    }
  }, [commit, toast]);

  const clearJobs = useCallback(() => { timers.current.forEach(clearTimeout); timers.current.clear(); }, []);
  const reset = useCallback(() => { notified.current.clear(); clearJobs(); commit(activatePersona(getSeed(clockNow()), actor.current, clockNow())); toast('데이터를 초기화했어요'); }, [clearJobs, commit, toast]);
  const replaceDb = useCallback((next: DB) => { notified.current.clear(); clearJobs(); commit(next); }, [clearJobs, commit]);

  useEffect(() => {
    let selected: PersonaId = 'kim'; let mode: 'light' | 'dark' = 'light';
    try { const stored = JSON.parse(localStorage.getItem('oq:v1:ui') ?? '{}'); if (['kim', 'lee', 'park', 'ops'].includes(stored.personaId)) selected = stored.personaId; if (stored.theme === 'dark') mode = 'dark'; } catch { /* first run */ }
    actor.current = selected; setPersonaId(selected); setTheme(mode); document.documentElement.dataset.theme = mode;
    let initial: DB;
    try {
      const value = readStored(localStorage);
      if (!value) throw new Error('seed');
      initial = value; rev.current = value.rev ?? 0;
    } catch { initial = getSeed(clockNow()); if (localStorage.getItem('oq:v1:db')) toast('저장한 데이터를 읽지 못해 초기화했어요', 'info'); }
    commit(activatePersona(ensureDay(initial, clockNow()), selected, clockNow()));
    setNow(clockNow()); document.documentElement.dataset.hydrated = 'true';
    if (localStorage.getItem('oq:test') === '1') {
      document.documentElement.dataset.testMode = 'true';
      const old = window.__OQ_TEST__;
      window.__OQ_TEST__ = {
        getDB: () => current.current!, reset,
        loadScenario: (name) => { notified.current.clear(); clearJobs(); commit(activatePersona(loadScenario(name, clockNow()), actor.current, clockNow())); },
        playHyperFrame: (variant, payload, options) => playHyperFrame(variant, payload, undefined, options),
        hyperframes: old?.hyperframes ?? [], teams: old?.teams ?? [],
        showTypingFor: (threadKey) => window.dispatchEvent(new CustomEvent('oq:typing', { detail: threadKey })),
      };
    }
    const receive = () => {
      try {
        const value = readStored(localStorage);
        if (value && value.rev > rev.current) {
          const changedDay = current.current?.dayKey !== value.dayKey;
          rev.current = value.rev; current.current = value; setDb(value);
          if (changedDay) commit(activatePersona(value, actor.current, clockNow()));
        }
      } catch { /* ignore incomplete remote writes */ }
    };
    if (typeof BroadcastChannel !== 'undefined') { channel.current = new BroadcastChannel('oq-sync'); channel.current.onmessage = receive; }
    window.addEventListener('storage', receive); window.addEventListener('oq:db', receive);
    const tick = setInterval(() => setNow(clockNow()), 250);
    const daily = setInterval(() => { if (current.current) { const next = ensureDay(current.current, clockNow()); if (next !== current.current) commit(activatePersona(next, actor.current, clockNow())); } }, 60_000);
    const scheduled = timers.current;
    return () => { channel.current?.close(); channel.current = null; clearInterval(tick); clearInterval(daily); window.removeEventListener('storage', receive); window.removeEventListener('oq:db', receive); scheduled.forEach(clearTimeout); scheduled.clear(); if (noticeTimer.current) clearTimeout(noticeTimer.current); };
  }, [clearJobs, commit, reset, toast]);

  useEffect(() => {
    if (!db) return;
    Object.values(db.teams).forEach((thread) => {
      if (!thread.pendingReplyFor) return;
      const key = `reply:${thread.pendingReplyFor}`;
      if (!timers.current.has(key)) {
        timers.current.set(key, setTimeout(() => {
          timers.current.delete(key);
          if (current.current?.teams[thread.key]?.pendingReplyFor !== thread.pendingReplyFor) return;
          const sender = thread.messages.find((message) => message.id === thread.pendingReplyFor)?.senderId ?? thread.participants[0];
          const next = dispatch({ type: 'teams/reply', threadKey: thread.key }, sender, true);
          if (next && window.__OQ_TEST__) { const record = [...window.__OQ_TEST__.teams].reverse().find((x) => x.threadKey === thread.key && x.replyAt == null); if (record) record.replyAt = performance.now(); }
        }, 1200));
      }
    });
  }, [db, dispatch]);

  useEffect(()=>{if(!db)return;const incoming=db.notifications.filter(n=>n.userId===personaId&&!n.read&&!notified.current.has(n.id));incoming.forEach(n=>notified.current.add(n.id));const latest=incoming.at(-1);if(latest)toast(latest.text,'info');},[db,personaId,toast]);

  const setPersona = (id: PersonaId) => { actor.current = id; setPersonaId(id); localStorage.setItem('oq:v1:ui', JSON.stringify({ personaId: id, theme })); const latest = readStored(localStorage); const base = latest && latest.rev > rev.current ? latest : current.current; if (base) commit(activatePersona(base, id, clockNow())); };
  const toggleTheme = () => { const next = theme === 'light' ? 'dark' : 'light'; setTheme(next); document.documentElement.dataset.theme = next; localStorage.setItem('oq:v1:ui', JSON.stringify({ personaId, theme: next })); };
  const openThread = (context: 'handover' | 'market', refId: string, other: UserId) => {
    const key = `${context}:${refId}:${[actor.current, other].sort().join(':')}`;
    const latest = readStored(localStorage); const base = latest && latest.rev > rev.current ? latest : current.current;
    try {if (base&&commit(ensureThread(base, context, refId, actor.current, other, clockNow())))return key;}catch(error){toast(error instanceof Error?error.message:'대화를 열 수 없어요','danger');}
    return '';
  };
  return <DbContext.Provider value={{ db, user: db?.users[personaId] ?? null, personaId, theme, now, dispatch, setPersona, toggleTheme, reset, replaceDb, openThread, toast }}>
    {children}
    {notice && <div className={`toast ${notice.kind}`} data-testid="toast" data-kind={notice.kind} role="status">{notice.text}</div>}
  </DbContext.Provider>;
}
