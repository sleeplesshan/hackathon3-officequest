import { describe, it, expect } from 'vitest';
import { getSeed } from '../../src/lib/db/seed';
import { applyAction, ensureDay } from '../../src/lib/db/reducer';
import { canAction } from '../../src/lib/guards';
import { canBrowseBoard, canBrowseQuest, isMyQuest } from '../../src/lib/quest-access';
import { equippedAppearance, OUTFITS, type CharacterAppearance } from '../../src/lib/character';
const now=Date.parse('2026-10-21T14:02:48+09:00');

describe('expired quest access',()=>{
 it('locks public board including forged mine values; requested, applied, done remain available',()=>{
  const db=getSeed(now);db.timer.endsAt=now;
  for(const mine of [undefined,'all','someone','requestedx'])expect(canBrowseBoard(db,'kim',now,mine)).toBe(false);
  for(const mine of ['requested','applied','done'])expect(canBrowseBoard(db,'kim',now,mine)).toBe(true);
  expect(canBrowseBoard(db,'ops',now)).toBe(true);
 });
 it('permits owner, applicant, worker, and public inquiry answerer, and refuses others',()=>{
  const db=getSeed(now);db.timer.endsAt=now;const q=db.quests.find(q=>q.no===3)!;
  expect(canBrowseQuest(db,q,'kim',now)).toBe(false);
  expect(canAction(db,{type:'quest/view',no:3},'kim',now)).toMatchObject({ok:false,code:'TIMER_EXPIRED'});
  for(const actor of ['kang'])expect(canBrowseQuest(db,q,actor,now)).toBe(true);
  q.answers=[{id:'a1',authorId:'kim',bodyHtml:'도움되는 답변입니다.',attachments:[],createdAt:new Date(now).toISOString()}];
  expect(isMyQuest(q,'kim')).toBe(true);expect(canBrowseQuest(db,q,'kim',now)).toBe(true);
  q.workerId='lee';expect(canBrowseQuest(db,q,'lee',now)).toBe(true);
  q.applications=[{userId:'park',resolve:'지원합니다',appliedAt:'',pledgeAgreedAt:''}];expect(canBrowseQuest(db,q,'park',now)).toBe(true);
  expect(canBrowseQuest(db,q,'ops',now)).toBe(true);
 });
 it('reopens at timer reset and KST next-day reset, while view does not consume time',()=>{
  const db=getSeed(now);db.timer.endsAt=now;
  expect(canBrowseBoard(applyAction(db,{type:'timer/reset'},'kim',now),'kim',now)).toBe(true);
  const tomorrow=now+86400000;expect(canBrowseBoard(db,'kim',tomorrow)).toBe(true);
  expect(canBrowseBoard(ensureDay(db,tomorrow),'kim',tomorrow)).toBe(true);
 });
});
describe('character appearance',()=>{
 for(const outfit of OUTFITS)it(`${outfit.id} unlocks at exactly level ${outfit.level}`,()=>{
  const db=getSeed(now);const action={type:'character/equip' as const,appearance:{gender:'female' as const,hair:'wave' as const,outfit:outfit.id}};
  db.users.kim!.exp=(outfit.level-1)*100;
  const next=applyAction(db,action,'kim',now);expect(next.users.kim!.appearance).toEqual(action.appearance);
  expect(next.users.kim!.points).toBe(db.users.kim!.points);expect(next.transactions).toEqual(db.transactions);
  if(outfit.level>1){db.users.kim!.exp--;expect(canAction(db,action,'kim',now)).toMatchObject({ok:false,code:'FORBIDDEN'});}
 });
 it('defaults old saved users, rejects invalid part IDs, and isolates actor appearance',()=>{
  const db=getSeed(now);expect(equippedAppearance(db.users.kim!)).toMatchObject({gender:'male',hair:'classic',equippedOutfit:'gold'});
  expect(canAction(db,{type:'character/equip',appearance:{gender:'female',hair:'broken',outfit:'gold'} as unknown as CharacterAppearance},'kim',now)).toMatchObject({ok:false,code:'VALIDATION'});
  const next=applyAction(db,{type:'character/equip',appearance:{gender:'female',hair:'wave',outfit:'silver'}},'kim',now);
  expect(next.users.lee!.appearance).toBeUndefined();expect(db.users.kim!.appearance).toBeUndefined();
 });
 it('season reset keeps hair and preferred outfit but renders an unlocked current-tier outfit',()=>{
  let db=getSeed(now);db=applyAction(db,{type:'character/equip',appearance:{gender:'female',hair:'wave',outfit:'gold'}},'kim',now);
  db=applyAction(db,{type:'season/reset'},'kim',now);
  expect(equippedAppearance(db.users.kim!)).toEqual({gender:'female',hair:'wave',outfit:'gold',equippedOutfit:'bronze'});
  db.users.kim!.exp=900;expect(equippedAppearance(db.users.kim!).equippedOutfit).toBe('gold');
 });
 it('auto follows level gains, and equip remains available after quest time expires',()=>{
  let db=getSeed(now);db.timer.endsAt=now;
  db=applyAction(db,{type:'character/equip',appearance:{gender:'male',hair:'wave',outfit:'auto'}},'kim',now);
  expect(equippedAppearance(db.users.kim!).equippedOutfit).toBe('gold');db.users.kim!.exp=1400;
  expect(equippedAppearance(db.users.kim!).equippedOutfit).toBe('platinum');
 });
});
