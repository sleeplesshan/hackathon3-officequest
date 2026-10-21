import { EXP_PER_LEVEL, TZ } from './constants';
import type { DB, Season, TierKey, User } from './types';
export const level = (exp: number): number => Math.floor(exp / EXP_PER_LEVEL) + 1;
export const expInLevel = (exp: number): number => exp % EXP_PER_LEVEL;
export const expToNext = (exp: number): number => EXP_PER_LEVEL - expInLevel(exp);
export const tier = (lv: number): TierKey => lv >= 25 ? 'master' : lv >= 20 ? 'diamond' : lv >= 15 ? 'platinum' : lv >= 10 ? 'gold' : lv >= 5 ? 'silver' : 'bronze';
export const tierForExp = (exp: number): TierKey => tier(level(exp));
export const TIER_ORDER: TierKey[] = ['bronze','silver','gold','platinum','diamond','master'];
export const TIER_LABELS: Record<TierKey,string> = {bronze:'브론즈',silver:'실버',gold:'골드',platinum:'플래티넘',diamond:'다이아',master:'마스터'};
export function expToNextTier(exp: number): number { return Math.max(0, ([400,900,1400,1900,2400].find(x=>x>exp) ?? exp)-exp); }
export function kstDayKey(now: number): string { return new Date(now+9*3600000).toISOString().slice(0,10); }
export const toISO = (now: number): string => new Date(now+9*3600000).toISOString().replace('Z','+09:00');
export const dayDifference = (end: string|number, now: number): number => (Date.parse(kstDayKey(typeof end==='number'?end:Date.parse(end))) - Date.parse(kstDayKey(now))) / 86400000;
export const seasonDaysRemaining = (season: Season, now: number): number => dayDifference(season.endsAt,now);
export const seasonProgress = (season: Season, now: number): number => Math.min(100,Math.max(0,Math.ceil((now-Date.parse(season.startsAt))/(Date.parse(season.endsAt)-Date.parse(season.startsAt))*100)));
export const ranking = (db: DB): User[] => Object.values(db.users).filter(u=>u.role==='player').sort((a,b)=>b.exp-a.exp || a.name.localeCompare(b.name,'ko'));
export const topFive = (db: DB): User[] => ranking(db).slice(0,5);
export const timerRemaining = (db: DB, now: number): number => Math.max(0,db.timer.endsAt-now);
export function formatTimer(ms: number): string { const s=Math.max(0,Math.ceil(ms/1000)); return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(n=>String(n).padStart(2,'0')).join(':'); }
export function formatKstDate(at: string|number): string { const parts=new Intl.DateTimeFormat('ko-KR',{timeZone:TZ,month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(at));const get=(type:string)=>parts.find(p=>p.type===type)?.value??'';return `${get('month')}.${get('day')} ${get('hour')}:${get('minute')}`; }
export const dailyCompletedCount = (db:DB,id:string):number => Object.values(db.daily[id]?.achieved ?? {}).filter(Boolean).length;
