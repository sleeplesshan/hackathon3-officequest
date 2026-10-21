import { describe, expect, it } from 'vitest';
import { activeRestriction, activeRestrictions, restrictionReason, restrictionStatus } from '@/lib/restrictions';
import { canAction, canApprove, canSubmit } from '@/lib/guards';
import { detectFlags } from '@/lib/monitoring';
import { DAY, NOW, fails, pending, questInput, seed, step } from './domain-fixtures';
import type { Action, RestrictionDuration, RestrictionKind } from '@/lib/types';

const restrict=(db=seed(),kinds:RestrictionKind[]=['quest_post','purchase'],duration:RestrictionDuration='3d')=>step(db,{type:'admin/restrict',userId:'kim',kinds,duration,reason:'운영 정책 위반 근거 확인 요청'},'ops');
describe('PRD §6.10 moderation and v2.3 idempotence',()=>{
  it('nonoperators cannot perform any admin action; operators cannot perform player writes',()=>{
    const db=seed();for(const action of [{type:'admin/restrict',userId:'kim',kinds:['purchase'],duration:'1d',reason:'운영 정책 소명 요청'},{type:'admin/lift',restrictionId:'r1',reason:'해제 소명 확인 완료'},{type:'admin/dismissFlag',flagId:'fast_high_bounty__A-107',reason:'소명 자료 확인 완료'}] as Action[])fails(db,action,'kim','FORBIDDEN');
    for(const action of [{type:'quest/create',input:questInput(),pledge:true},{type:'quest/update',no:7,patch:{}},{type:'quest/delete',no:7},{type:'quest/apply',no:7,resolve:'지원',pledge:true},{type:'quest/adopt',no:7,userId:'lee'},{type:'quest/submit',no:7,bodyHtml:'결과를 제출합니다',attachments:[]},{type:'quest/approve',no:7,stars:3},{type:'quest/reject',no:7,reason:'보완 요청합니다'},{type:'item/like',id:'m1'},{type:'item/confirmReceipt',id:'m1'},{type:'item/delete',id:'m1'},{type:'daily/claim',mission:'login'}] as Action[])fails(db,action,'ops','FORBIDDEN');
    expect(step(db,{type:'quest/view',no:7},'ops').quests[0]!.views).toBe(129);expect(step(db,{type:'item/view',id:'m1'},'ops').items[0]!.views).toBe(133);
  });
  it('reversed kinds create canonical quest_post r2 then purchase r3, one log each; input unaffected',()=>{
    const db=seed(),after=restrict(db,['purchase','quest_post']);expect(after.restrictions.slice(1).map(r=>[r.id,r.kind])).toEqual([['r2','quest_post'],['r3','purchase']]);
    expect(after.adminLog.slice(2).map(l=>[l.action,l.restrictionId,l.actorId])).toEqual([['restrict','r2','ops'],['restrict','r3','ops']]);expect(after.adminLog.slice(0,2)).toEqual(db.adminLog);expect(db.restrictions).toHaveLength(1);
    expect(after).toEqual(restrict(db,['quest_post','purchase']));
  });
  it('partially active two-kind request adds only missing kind; fully active rejects unchanged',()=>{
    const one=restrict(seed(),['quest_post']),first=structuredClone(one.restrictions.at(-1)),both=restrict(one,['purchase','quest_post']);
    expect(both.restrictions).toHaveLength(3);expect(both.adminLog).toHaveLength(4);expect(both.restrictions[1]).toEqual(first);expect(both.restrictions.at(-1)).toMatchObject({id:'r3',kind:'purchase'});
    fails(both,{type:'admin/restrict',userId:'kim',kinds:['quest_post','purchase'],duration:'7d',reason:'동일 제재 중복 요청 확인'},'ops','INVALID_STATE');
  });
  it('duplicate kinds do not duplicate restrictions or audit entries',()=>{
    const db=restrict(seed(),['purchase','purchase']);expect(activeRestrictions(db,'kim',NOW)).toHaveLength(1);expect(db.adminLog).toHaveLength(3);
  });
  it('flag-linked restriction marks actioned with evidence snapshot; closed/missing flag cannot be processed',()=>{
    const db=seed(),flag=detectFlags(db,NOW).find(f=>f.rule==='pair_5star')!;
    const action:Action={type:'admin/restrict',userId:'kang',kinds:['quest_post'],duration:'7d',reason:'반복 승인 활동 소명 요청',flagId:flag.id};const after=step(db,action,'ops');
    expect(after.restrictions.at(-1)).toMatchObject({id:'r2',flagId:flag.id});expect(after.flagStates[flag.id]).toMatchObject({status:'actioned',by:'ops',lastAt:flag.lastAt,evidenceCount:3});expect(after.adminLog.at(-1)?.flagId).toBe(flag.id);
    fails(after,action,'ops','INVALID_STATE');fails(db,{...action,flagId:'missing'},'ops','INVALID_STATE');expect(after.adminLog).toHaveLength(3);
  });
  it.each([[],['unknown']].map(kinds=>({kinds})))('invalid restriction kinds $kinds reject',({kinds})=>fails(seed(),{type:'admin/restrict',userId:'kim',kinds,duration:'1d',reason:'운영 정책 소명 요청'} as unknown as Action,'ops','VALIDATION'));
  it.each(['1234','a'.repeat(101)])('reason length %i invalid',reason=>fails(seed(),{type:'admin/restrict',userId:'kim',kinds:['quest_post'],duration:'1d',reason},'ops','VALIDATION'));
  it('operator target invalid; invalid duration rejected',()=>{
    fails(seed(),{type:'admin/restrict',userId:'ops',kinds:['purchase'],duration:'1d',reason:'운영 정책 소명 요청'},'ops','VALIDATION');fails(seed(),{type:'admin/restrict',userId:'kim',kinds:['purchase'],duration:'2d',reason:'운영 정책 소명 요청'} as unknown as Action,'ops','VALIDATION');
  });
  it.each(['1d','3d','7d'] as const)('%s restriction active until exact expiry, then expired without log/mutation',duration=>{
    const db=restrict(step(seed(),{type:'item/sellTo',id:'m4',userId:'kim'},'lee'),['purchase'],duration),r=db.restrictions.at(-1)!,days=Number.parseInt(duration);expect(Date.parse(r.endsAt!)-Date.parse(r.startsAt)).toBe(days*DAY);
    expect(restrictionStatus(r,NOW+days*DAY-1)).toBe('active');expect(restrictionStatus(r,NOW+days*DAY)).toBe('expired');expect(activeRestrictions(db,'kim',NOW+days*DAY)).toEqual([]);expect(db.adminLog).toHaveLength(3);
    fails(db,{type:'admin/lift',restrictionId:r.id,reason:'만료된 제재 해제 요청'},'ops','INVALID_STATE',NOW+days*DAY);
    expect(canAction(db,{type:'item/confirmReceipt',id:'m4'},'kim',NOW+days*DAY-1)).toMatchObject({ok:false,code:'RESTRICTED'});
    expect(canAction(db,{type:'item/confirmReceipt',id:'m4'},'kim',NOW+days*DAY)).toEqual({ok:true});
  });
  it('indefinite active indefinitely; lifted wins over expiration including seeded r1',()=>{
    const db=restrict(seed(),['purchase'],'indefinite'),r=db.restrictions.at(-1)!;expect(r.endsAt).toBeNull();expect(restrictionStatus(r,NOW+1000*DAY)).toBe('active');expect(restrictionReason(r)).toContain('해제 시까지');
    expect(restrictionStatus(db.restrictions[0]!,NOW)).toBe('lifted');const lifted={...r,liftedAt:new Date(NOW).toISOString(),endsAt:new Date(NOW-DAY).toISOString()};expect(restrictionStatus(lifted,NOW)).toBe('lifted');
  });
  it('lift one active restriction logs once, preserves other kind and previous log entries',()=>{
    const db=restrict(),original=structuredClone(db.adminLog),action:Action={type:'admin/lift',restrictionId:'r3',reason:'구매 소명 근거 확인 완료'};const after=step(db,action,'ops');
    expect(activeRestrictions(after,'kim',NOW).map(r=>r.kind)).toEqual(['quest_post']);expect(restrictionStatus(after.restrictions.find(r=>r.id==='r3')!,NOW)).toBe('lifted');expect(after.adminLog.slice(0,-1)).toEqual(original);expect(after.adminLog.at(-1)).toMatchObject({action:'lift',restrictionId:'r3',targetUserId:'kim'});
    fails(after,action,'ops','INVALID_STATE');fails(after,{...action,restrictionId:'missing'},'ops','INVALID_STATE');fails(db,{...action,reason:'1234'},'ops','VALIDATION');expect(after.adminLog).toHaveLength(db.adminLog.length+1);
  });
  it('dismissFlag logs once with snapshot; repeat and nonexistent flag INVALID_STATE',()=>{
    const db=seed(),id='fast_high_bounty__A-107',action:Action={type:'admin/dismissFlag',flagId:id,reason:'정상적인 사전 협의 업무 확인'};const after=step(db,action,'ops');
    expect(after.flagStates[id]).toMatchObject({status:'dismissed',evidenceCount:1});expect(after.adminLog.at(-1)).toMatchObject({action:'dismiss_flag',flagId:id});fails(after,action,'ops','INVALID_STATE');fails(db,{...action,flagId:'missing'},'ops','INVALID_STATE');fails(db,{...action,reason:'1234'},'ops','VALIDATION');expect(after.adminLog).toHaveLength(3);
  });
  it('restriction scope only blocks create/purchase and orgchart targets; final buyer designation survives',()=>{
    let db=step(seed(),{type:'item/sellTo',id:'m4',userId:'kim'},'lee');db=restrict(db);
    fails(db,{type:'quest/create',input:questInput(),pledge:true},'kim','RESTRICTED');fails(db,{type:'item/confirmReceipt',id:'m5'},'kim','RESTRICTED');expect(db.items.find(i=>i.id==='m4')?.finalBuyerId).toBe('kim');
    fails(db,{type:'item/reserve',id:'m7',userId:'kim'},'park','RESTRICTED');fails(db,{type:'item/sellTo',id:'m7',userId:'kim'},'park','RESTRICTED');fails(db,{type:'item/confirmReceipt',id:'m4'},'kim','RESTRICTED');
    expect(canAction(db,{type:'quest/answer',no:3,bodyHtml:'질문의 해결 방법을 답변합니다.',attachments:[]},'kim',NOW)).toEqual({ok:true});const submission=pending(),restrictedLee=step(submission,{type:'admin/restrict',userId:'lee',kinds:['quest_post'],duration:'1d',reason:'등록만 제한하고 수행은 허용'},'ops');
    expect(canApprove(restrictedLee,'kim',7,NOW)).toEqual({ok:true});
    const revision=step(restrictedLee,{type:'quest/reject',no:7,reason:'보완할 서식을 확인해 주세요'});
    expect(canSubmit(revision,'lee',7,NOW)).toEqual({ok:true});
    const restrictedRequester=restrict(submission,['quest_post']);expect(canApprove(restrictedRequester,'kim',7,NOW)).toEqual({ok:true});
  });
  it('guard priority: FORBIDDEN then RESTRICTED then TIMER_EXPIRED then validation',()=>{
    const db=step(restrict(),{type:'timer/expire'}),action:Action={type:'quest/create',input:questInput(-1),pledge:true};
    expect(canAction(db,action,'ops',NOW)).toMatchObject({code:'FORBIDDEN'});expect(canAction(db,action,'kim',NOW)).toMatchObject({code:'RESTRICTED'});expect(canAction(db,action,'lee',NOW)).toMatchObject({code:'TIMER_EXPIRED'});
    expect(activeRestriction(db,'kim','purchase',NOW)).toBeDefined();expect(restrictionReason(activeRestriction(db,'kim','purchase',NOW)!)).toContain('운영자 제재로 구매가 제한됐어요');
  });
});
