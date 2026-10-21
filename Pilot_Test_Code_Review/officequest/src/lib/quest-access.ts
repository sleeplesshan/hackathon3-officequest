import { kstDayKey } from './formulas';
import type { DB, Quest, UserId } from './types';
export const QUEST_TIME_NOTICE = '오늘 참여 가능한 시간이 모두 지났어요';
export function questTimeExpired(db: DB, now: number): boolean {
  return db.dayKey === kstDayKey(now) && db.timer.endsAt <= now;
}
export function isMyQuest(quest: Quest, actor: UserId): boolean {
  return quest.requesterId === actor || quest.workerId === actor || quest.applications.some(a => a.userId === actor) || (quest.answers ?? []).some(a => a.authorId === actor);
}
export function canBrowseBoard(db: DB, actor: UserId, now: number, mine?: string | null): boolean {
  return db.users[actor]?.role === 'admin' || !questTimeExpired(db, now) || ['requested', 'applied', 'done'].includes(mine ?? '');
}
export function canBrowseQuest(db: DB, quest: Quest, actor: UserId, now: number): boolean {
  return db.users[actor]?.role === 'admin' || !questTimeExpired(db, now) || isMyQuest(quest, actor);
}
