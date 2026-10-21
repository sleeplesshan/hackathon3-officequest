import { describe, expect, it } from 'vitest';
import { expInLevel, expToNext, expToNextTier, formatTimer, kstDayKey, level, ranking, seasonDaysRemaining, seasonProgress, tier, timerRemaining, topFive } from '@/lib/formulas';
import { activatePersona, ensureDay } from '@/lib/db/reducer';
import { DAY, NOW, seed, step } from './domain-fixtures';

describe('PRD §6 formulas and clocks',()=>{
  it.each([[0,1,'bronze'],[99,1,'bronze'],[100,2,'bronze'],[399,4,'bronze'],[400,5,'silver'],[899,9,'silver'],[900,10,'gold'],[1399,14,'gold'],[1400,15,'platinum'],[1899,19,'platinum'],[1900,20,'diamond'],[2399,24,'diamond'],[2400,25,'master'],[1168,12,'gold'],[650,7,'silver'],[750,8,'silver']] as const)('EXP %i → level %i / %s',(exp,lv,t)=>{
    expect(level(exp)).toBe(lv); expect(tier(lv)).toBe(t); expect(expInLevel(exp)).toBe(exp%100); expect(expToNext(exp)).toBe(100-exp%100);
  });
  it('next tier, KST calendar D-Day and ceil season progress',()=>{
    const db=seed(); expect(expToNextTier(1168)).toBe(232); expect(expToNextTier(2400)).toBe(0);
    expect(seasonDaysRemaining(db.season,NOW)).toBe(14); expect(seasonProgress(db.season,NOW)).toBe(78);
    expect(seasonProgress(db.season,Date.parse(db.season.startsAt)-1)).toBe(0); expect(seasonProgress(db.season,Date.parse(db.season.endsAt)+1)).toBe(100);
    expect(kstDayKey(Date.parse('2026-10-21T14:59:59.999Z'))).toBe('2026-10-21'); expect(kstDayKey(Date.parse('2026-10-21T15:00:00Z'))).toBe('2026-10-22');
  });
  it('ranking excludes ops, sorts EXP then Korean name, and TOP5 has five',()=>{
    const db=seed(); expect(topFive(db).map(u=>u.id)).toEqual(['park','choi','jung','kim','lee']);
    db.users.kim!.exp=db.users.lee!.exp; db.users.ops!.exp=999999;
    const equal=ranking(db).filter(u=>u.exp===650); expect(equal.map(u=>u.name)).toEqual(equal.map(u=>u.name).sort((a,b)=>a.localeCompare(b,'ko')));
    expect(ranking(db).some(u=>u.id==='ops')).toBe(false);
  });
  it('timer toggle/expire/reset/plus30 caps at 2h and revives expired timers',()=>{
    let db=seed(); expect(timerRemaining(db,NOW)).toBe(7_200_000); expect(formatTimer(7_200_000)).toBe('02:00:00');
    db=step(db,{type:'timer/toggle'}); expect(timerRemaining(db,NOW)).toBe(0);
    db=step(db,{type:'timer/plus30'}); expect(timerRemaining(db,NOW)).toBe(1_800_000);
    db=step(db,{type:'timer/toggle'}); db=step(db,{type:'timer/toggle'}); expect(timerRemaining(db,NOW)).toBe(7_200_000);
    db=step(db,{type:'timer/plus30'}); expect(timerRemaining(db,NOW)).toBe(7_200_000);
    db=step(db,{type:'timer/expire'}); expect(db.timer.endsAt).toBe(NOW);
    db=step(db,{type:'timer/reset'}); expect(db.timer.endsAt).toBe(NOW+7_200_000); expect(timerRemaining(db,NOW+DAY)).toBe(0); expect(formatTimer(-1)).toBe('00:00:00');
  });
  it('KST rollover resets all daily state and timer once; persona login is per user',()=>{
    const before=seed(); before.daily.kim!.claimed.login=true;
    const next=ensureDay(before,NOW+DAY);
    expect(next.dayKey).toBe('2026-10-22'); expect(next.timer.endsAt).toBe(NOW+DAY+7_200_000);
    for(const u of Object.values(next.users))expect(u.completedToday).toBe(0);
    for(const d of Object.values(next.daily)){expect(Object.values(d.achieved).some(Boolean)).toBe(false); expect(Object.values(d.claimed).some(Boolean)).toBe(false);}
    expect(ensureDay(next,NOW+DAY+1000)).toEqual(next);
    const active=activatePersona(next,'lee',NOW+DAY); expect(active.daily.lee!.achieved.login).toBe(true); expect(active.daily.kim!.achieved.login).toBe(false);
  });
  it('season reset keeps points, completion totals, ratings and records; awards old label',()=>{
    const before=seed(),after=step(before,{type:'season/reset'});
    expect(after.season).toMatchObject({id:2,label:'2026 Season 2'}); expect(kstDayKey(Date.parse(after.season.endsAt))).toBe('2026-11-18');
    expect(new Date(after.season.endsAt).getHours()).toBe(23); expect(new Date(after.season.endsAt).getMinutes()).toBe(59);
    for(const u of Object.values(after.users)){expect(u.exp).toBe(0); expect(u.points).toBe(before.users[u.id]!.points); expect(u.completedTotal).toBe(before.users[u.id]!.completedTotal); expect(u.rating).toEqual(before.users[u.id]!.rating); expect(u.seasonBadges).toContain('2026 Season 1');}
    expect(after.quests).toEqual(before.quests); expect(after.items).toEqual(before.items); expect(after.transactions).toEqual(before.transactions); expect(after.ratings).toEqual(before.ratings);
  });
});
