export const TZ = 'Asia/Seoul';
export const EXP_PER_LEVEL = 100;
export const QUEST_BASE_REWARD_P = 100;
export const QUEST_REWARD_EXP = 100;                     // = RATING_EXP[3] (기준값, 표시용)
export const RATING_EXP = { 1: 50, 2: 75, 3: 100, 4: 125, 5: 150 } as const;   // D40
export const REJECT_LIMIT = 2;                           // D45
export const MONITOR_WINDOW_DAYS = 14;                   // D49
export const MONITOR_RULES = { pairRepeatMin: 3, reciprocalMin: 2, pair5StarMin: 3, fastBountyMin: 500, fastMinutesMax: 30, marketPairCountMin: 3, marketPairSumCountMin: 2, marketPairSumMin: 2000 } as const;   // R5 = count ≥ 3 || (count ≥ 2 && sum ≥ 2000), 0 P 제외 (D58)
export const RESTRICTION_DURATIONS = { '1d': 1, '3d': 3, '7d': 7, indefinite: null } as const;   // 일 수, D50
export const ADMIN_ID = 'ops';
export const SEED_STALE_DAYS = 5;   // D61
export const DAILY_MISSION_REWARD_P = 10;
export const DAILY_MISSION_REWARD_EXP = 50;
export const DAILY_COMPLETE_LIMIT = 2;
export const SESSION_TIMER_MS = 2 * 60 * 60 * 1000;      // 02:00:00
export const TIMER_PLUS_MS = 30 * 60 * 1000;               // +30분
export const BOUNTY_MAX = 1000;
export const BOUNTY_STEP = 10;
export const BOUNTY_PRESETS = [50, 100, 300, 500] as const;
export const HYPERFRAME_MS = 1800;
export const TEAMS_TYPING_MS = 1200;
export const NPC_AUTO_APPROVE_MS = 1200;
export const SEASON1 = { id: 1, label: '2026 Season 1', startsAt: '2026-09-02T00:00:00+09:00', endsAt: '2026-11-04T23:59:59+09:00' };
export const NEXT_SEASON_DAYS = 28;
export const STORAGE_KEYS = { db: 'oq:v1:db', ui: 'oq:v1:ui', test: 'oq:test' } as const;
export const BROADCAST_CHANNEL = 'oq-sync';
export const VALIDATION = {
  questTitle: [2, 60], questBodyMinText: 20, resolveLine: [1, 60], resultBodyMinText: 10, rejectReasonMin: 5,
  itemTitle: [2, 40], itemPriceMin: 10, itemPriceMax: 100000, itemPriceStep: 10, itemPhotosMax: 5, photoMaxBytes: 2 * 1024 * 1024,
} as const;
