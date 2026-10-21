import { describe, expect, it } from 'vitest';
import { detectFlags, isSeedStale } from '@/lib/monitoring';
import { toISO } from '@/lib/formulas';
import { DAY, NOW, seed, step } from './domain-fixtures';
import type { DB, RatingRecord, Stars, Transaction } from '@/lib/types';

function clean():DB{const db=seed();db.ratings=[];db.transactions=[];db.flagStates={};return db;}
function rating(index:number,patch:Partial<RatingRecord>={}):RatingRecord{return {id:`test${index}`,questRef:`T-${index}`,archived:true,requesterId:'choi',workerId:'kang',stars:4,bounty:100,postedAt:toISO(NOW-DAY),approvedAt:toISO(NOW-1000+index),...patch};}
function purchases(amounts:number[],patch:Partial<Transaction>={}):Transaction[]{return amounts.map((amount,index)=>({id:`tx${index}`,type:'market_purchase',userId:index%2?'choi':'jung',counterpartyId:index%2?'jung':'choi',amount:-amount,balanceAfter:100,refType:'item',refId:`X-${index}`,memo:'과거 거래',at:toISO(NOW-1000+index),...patch}));}
const ids=(db:DB,now=NOW)=>detectFlags(db,now).map(f=>f.id);

describe('PRD §6.11 monitoring v2.3',()=>{
  it('§9.7 seed: exact four IDs, order, severity, evidence counts and R3 alsoMatched',()=>{
    const flags=detectFlags(seed(),NOW);
    expect(flags.map(f=>[f.id,f.severity,f.evidence.length,f.alsoMatched])).toEqual([
      ['fast_high_bounty__A-107','high',1,[]],['reciprocal__han__jung','high',4,[]],['market_pair__choi__jung','medium',3,[]],['pair_5star__choi__kang','medium',3,['pair_repeat']],
    ]);
    expect(flags.map(f=>f.evidence.map(e=>e.refId))).toEqual([['rt9'],['rt6','rt7','rt8','rt9'],expect.any(Array),['rt3','rt4','rt5']]);
    expect(flags.every(f=>f.status==='open'&&f.newEvidence===0)).toBe(true);expect(flags.some(f=>f.subjects.some(id=>['kim','lee','park'].includes(id)))).toBe(false);
    for(const f of flags)for(const e of f.evidence){expect(e.text).toContain(e.kind==='rating'?'별점':'P');expect(Number.isFinite(Date.parse(e.at))).toBe(true);}
  });
  it.each([2,3,4])('R1 repeated directed pair count %i threshold 3',count=>{
    const db=clean();db.ratings=Array.from({length:count},(_,i)=>rating(i));expect(ids(db)).toEqual(count>=3?['pair_repeat__choi__kang']:[]);
  });
  it.each([[1,2,false],[2,1,false],[2,2,true]] as const)('R2 reciprocal %i/%i thresholds each 2',(forward,backward,expected)=>{
    const db=clean();db.ratings=[...Array.from({length:forward},(_,i)=>rating(i)),...Array.from({length:backward},(_,i)=>rating(i+10,{requesterId:'kang',workerId:'choi'}))];
    expect(ids(db).includes('reciprocal__choi__kang')).toBe(expected);if(expected)expect(detectFlags(db,NOW)[0]?.evidence).toHaveLength(4);
  });
  it.each(([ [5,5],[5,5,5],[5,4,5],[5,5,5,5] ] as Stars[][]).map(stars=>({stars})))('R3 all five-star ratings $stars deduplicates R1',({stars})=>{
    const db=clean();db.ratings=stars.map((s,i)=>rating(i,{stars:s}));const flags=detectFlags(db,NOW);
    if(stars.length<3)expect(flags).toEqual([]);else if(stars.every(s=>s===5)){expect(flags).toHaveLength(1);expect(flags[0]).toMatchObject({id:'pair_5star__choi__kang',alsoMatched:['pair_repeat']});}else expect(ids(db)).toEqual(['pair_repeat__choi__kang']);
  });
  it.each([[499,30*60000,false],[500,30*60000,true],[500,30*60000+1,false],[500,0,true],[500,-1,false]] as const)('R4 bounty %i duration %i threshold 500P / 30 minutes',(bounty,duration,flagged)=>{
    const db=clean();db.ratings=[rating(0,{bounty,postedAt:toISO(NOW-duration),approvedAt:toISO(NOW)})];expect(ids(db)).toEqual(flagged?['fast_high_bounty__T-0']:[]);
  });
  it.each([[2500],[1000,1000],[1000,999],[10,10],[10,10,10],[800,800,800],[0,0,0],[0,1000,1000],[0,1999]].map(amounts=>({amounts})))('R5 count/sum/positive prices $amounts',({amounts})=>{
    const db=clean();db.transactions=purchases(amounts);const paid=amounts.filter(x=>x>0),matched=paid.length>=3||(paid.length>=2&&paid.reduce((a,b)=>a+b,0)>=2000);
    expect(ids(db)).toEqual(matched?['market_pair__choi__jung']:[]);if(matched)expect(detectFlags(db,NOW)[0]?.evidence).toHaveLength(paid.length);
  });
  it('R5 ignores sale-side ledger duplicates and counts only purchase entries',()=>{
    const db=clean();db.transactions=[...purchases([1000]),...purchases([1000],{id:'sale',type:'market_sale',amount:1000})];expect(ids(db)).toEqual([]);
  });
  it('14-day inclusive window: exact lower bound included, 1ms older and future excluded',()=>{
    for(const at of [NOW-14*DAY,NOW-14*DAY-1,NOW+1]){
      const db=clean();db.ratings=[0,1,2].map(i=>rating(i,{approvedAt:toISO(at),postedAt:toISO(at-DAY)}));
      expect(ids(db)).toEqual(at===NOW-14*DAY?['pair_repeat__choi__kang']:[]);
      db.ratings=[];db.transactions=purchases([10,10,10],{at:toISO(at)});expect(ids(db)).toEqual(at===NOW-14*DAY?['market_pair__choi__jung']:[]);
    }
  });
  it('operator excluded from every rating and market rule, even with qualifying records',()=>{
    const db=clean();db.ratings=[0,1,2].map(i=>rating(i,{requesterId:'ops',stars:5,bounty:500,postedAt:toISO(NOW-60000)}));db.transactions=purchases([1000,1000,1000],{counterpartyId:'ops'});expect(detectFlags(db,NOW)).toEqual([]);
    db.ratings=db.ratings.map(r=>({...r,requesterId:'choi',workerId:'ops'}));expect(detectFlags(db,NOW)).toEqual([]);
  });
  it('same input deterministic, pure, and evidence is sorted by time then ref ID',()=>{
    const db=clean();db.ratings=[rating(2),rating(0),rating(1)];const copy=structuredClone(db),a=detectFlags(db,NOW),b=detectFlags(db,NOW);expect(a).toEqual(b);expect(db).toEqual(copy);expect(a[0]?.evidence.map(e=>e.refId)).toEqual(['test0','test1','test2']);
  });
  it.each(['dismissed','actioned'] as const)('flagStates merges %s; one newer record reopens with newEvidence=1',status=>{
    let db=seed();const flag=detectFlags(db,NOW).find(f=>f.rule==='pair_5star')!;
    if(status==='dismissed')db=step(db,{type:'admin/dismissFlag',flagId:flag.id,reason:'소명 근거 자료 확인 완료'},'ops');
    else db=step(db,{type:'admin/restrict',userId:'kang',kinds:['quest_post'],duration:'1d',reason:'반복 승인 활동 소명 요청',flagId:flag.id},'ops');
    expect(db.flagStates[flag.id]).toMatchObject({status,lastAt:flag.lastAt,evidenceCount:3});expect(detectFlags(db,NOW).find(f=>f.id===flag.id)).toMatchObject({status,newEvidence:0});
    db.ratings.push(rating(20,{stars:5,approvedAt:toISO(NOW),postedAt:toISO(NOW-DAY)}));expect(detectFlags(db,NOW).find(f=>f.id===flag.id)).toMatchObject({status:'open',newEvidence:1});
    const reprocessed=step(db,{type:'admin/dismissFlag',flagId:flag.id,reason:'재발 활동 소명 자료 재확인'},'ops');expect(reprocessed.flagStates[flag.id]).toMatchObject({status:'dismissed',evidenceCount:4});
  });
  it('processed state remains closed when an equal-time record arrives; unrelated states do not create flags',()=>{
    const db=seed(),flag=detectFlags(db,NOW).find(f=>f.rule==='pair_5star')!;db.flagStates[flag.id]={status:'dismissed',by:'ops',at:toISO(NOW),note:'자료 확인 완료',lastAt:flag.lastAt,evidenceCount:3};
    db.ratings.push(rating(50,{stars:5,approvedAt:flag.lastAt}));db.flagStates.unknown={...db.flagStates[flag.id]!};expect(detectFlags(db,NOW).find(f=>f.id===flag.id)).toMatchObject({status:'dismissed',newEvidence:0});expect(ids(db)).not.toContain('unknown');
  });
  it.each([['2026-10-27T15:00:00+09:00',3],['2026-10-28T16:20:00+09:00',2],['2026-10-29T12:10:00+09:00',1],['2026-11-03T09:12:00+09:00',0]] as const)('seed evidence lifetime immediately after %s → %i flags',(date,count)=>{
    // Window includes its exact lower endpoint, so disappearance is 1ms after these instants.
    expect(detectFlags(seed(),Date.parse(date)+1)).toHaveLength(count);
  });
  it('isSeedStale turns true exactly at 5 days',()=>{
    expect(isSeedStale(seed(),NOW+5*DAY-1)).toBe(false);expect(isSeedStale(seed(),NOW+5*DAY)).toBe(true);
  });
});
