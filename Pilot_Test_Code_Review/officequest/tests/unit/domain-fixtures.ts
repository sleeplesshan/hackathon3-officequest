import { expect } from 'vitest';
import { applyAction } from '@/lib/db/reducer';
import { getSeed } from '@/lib/db/seed';
import { DomainError } from '@/lib/types';
import type { Action, DB, DomainErrorCode, ItemInput, QuestInput, UserId } from '@/lib/types';

export const NOW = Date.parse('2026-10-21T14:02:48+09:00');
export const DAY = 86_400_000;
export const seed = (): DB => getSeed(NOW);
export const questInput = (bounty=300): QuestInput => ({ type:'request', title:'자동화 업무 요청', field:'재무·엑셀 자동화', dueAt:'2026-10-23T18:00:00+09:00', bodyHtml:'<p>원가 분석과 자료 정리를 자동화하는 업무를 요청합니다.</p>', attachments:[], bounty });
export const itemInput = (price=100): ItemInput => ({ title:'업무용 모니터', village:'mapo', category:'digital', mode:price===0?'free':'sale', price, bodyHtml:'깨끗하게 사용한 물품입니다.', photos:[] });
export const step = (db:DB, action:Action, actor:UserId='kim', now=NOW): DB => applyAction(db,action,actor,now);
export const q = (db:DB,no=7) => db.quests.find(x=>x.no===no)!;
export const item = (db:DB,id='m1') => db.items.find(x=>x.id===id)!;
export function fails(db:DB,action:Action,actor:UserId,code:DomainErrorCode,now=NOW):void {
  const before=structuredClone(db);
  try { step(db,action,actor,now); expect.fail(`Expected ${action.type} to reject with ${code}`); }
  catch(error) { expect(error).toBeInstanceOf(DomainError); expect((error as DomainError).code).toBe(code); }
  expect(db).toEqual(before);
}
export function pending():DB {
  let db=step(seed(),{type:'quest/adopt',no:7,userId:'lee'});
  db=step(db,{type:'quest/submit',no:7,bodyHtml:'업무 결과와 매크로를 완성하여 제출합니다.',attachments:[]},'lee');
  return db;
}
