import { expect, it } from 'vitest';
import { formatRating, ratingExp } from '@/lib/rating';
import { NOW, fails, pending, step, q } from './domain-fixtures';
import type { Action, Stars } from '@/lib/types';
it.each([[1,50],[2,75],[3,100],[4,125],[5,150]] as const)('AC-8.14.2: stars %i maps to +%i EXP, same 100+B points and one rating record',(stars,exp)=>{
  const db=pending(),after=step(db,{type:'quest/approve',no:7,stars});
  expect(ratingExp(stars)).toBe(exp);expect(after.users.lee!.exp).toBe(650+exp);expect(after.users.lee!.points).toBe(700);
  expect(after.users.kim!.points).toBe(db.users.kim!.points);expect(after.users.lee!.rating).toEqual({sum:33+stars,count:9});
  expect(after.users.lee).toMatchObject({completedToday:2,completedTotal:9});expect(q(after)).toMatchObject({status:'done',escrowHeld:0,reviewPending:false,rating:{stars}});
  expect(after.ratings).toHaveLength(db.ratings.length+1);expect(after.ratings.at(-1)).toMatchObject({questRef:'7',archived:false,requesterId:'kim',workerId:'lee',stars,bounty:300});
  expect(Date.parse(after.ratings.at(-1)!.approvedAt)).toBe(NOW);expect(q(after).submissions.at(-1)?.review?.result).toBe('approved');
  fails(after,{type:'quest/approve',no:7,stars},'kim','INVALID_STATE');
  const claimed=step(after,{type:'daily/claim',mission:'complete'},'lee');expect(claimed.users.lee!.exp).toBe(650+exp+50);expect(claimed.users.lee!.points).toBe(710);
});
it.each([undefined,0,6])('stars %s reject with RATING_REQUIRED and preserve DB',(stars)=>{
  fails(pending(),{type:'quest/approve',no:7,stars:stars as Stars} as Action,'kim','RATING_REQUIRED');
});
it.each([[99,23,'4.3 · 평가 23건'],[41,9,'4.6 · 평가 9건'],[38,9,'4.2 · 평가 9건'],[0,0,'평가 없음']] as const)('formatRating(%i/%i) = %s',(sum,count,text)=>expect(formatRating({sum,count})).toBe(text));
