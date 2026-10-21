import { expect, it } from 'vitest';
import { activatePersona, ensureDay } from '@/lib/db/reducer';
import { detectFlags } from '@/lib/monitoring';
import { activeRestrictions } from '@/lib/restrictions';
import { mulberry32 } from '@/lib/rng';
import { DomainError } from '@/lib/types';
import { DAY, NOW, itemInput, questInput, seed, step } from './domain-fixtures';
import type { Action, DB, Stars } from '@/lib/types';

const total=(db:DB)=>Object.values(db.users).reduce((n,u)=>n+u.points,0)+db.quests.reduce((n,q)=>n+q.escrowHeld,0);
it('PRD §6.2/6.8: 500 seeded action steps preserve points, nonnegative balances, escrow and all three rating invariants',()=>{
  const random=mulberry32(42),pick=<T,>(values:readonly T[]):T=>values[Math.floor(random()*values.length)]!;
  let db=seed(),now=NOW,flowNo=0,approvals=0,dailyRewards=0,adminSuccesses=0;
  const baseline=structuredClone(db.users),seedRatingIds=new Set(db.ratings.map(r=>r.id)),successes=new Set<string>();
  for(let index=0;index<500;index++){
    if(index%50===0){now=NOW+Math.floor(index/50)*DAY;db=ensureDay(db,now);db=activatePersona(db,'kim',now);}
    const phase=index%50;let action:Action,actor='kim';
    // Ten complete flows make reward and rating invariants nonvacuous. Every
    // bounty/star choice and the other 450 actions use the fixed random seed.
    if(phase===0){flowNo=db.counters.nextQuestNo;action={type:'quest/create',input:questInput(pick([0,50,100,300,500])),pledge:true};}
    else if(phase===1){action={type:'quest/apply',no:flowNo,resolve:'꼼꼼하게 검증하여 제출하겠습니다',pledge:true};actor='lee';}
    else if(phase===2)action={type:'quest/adopt',no:flowNo,userId:'lee'};
    else if(phase===3){action={type:'quest/submit',no:flowNo,bodyHtml:'업무 결과와 검증 자료를 모두 작성했습니다.',attachments:[]};actor='lee';}
    else if(phase===4)action={type:'quest/approve',no:flowNo,stars:pick([1,2,3,4,5] as const)};
    else {
      const bucket=Math.floor(random()*12),quest=pick(db.quests),market=pick(db.items),players=Object.values(db.users).filter(u=>u.role==='player');actor=pick(players).id;
      switch(bucket){
        case 0:action={type:'quest/create',input:questInput(pick([0,50,100,300,1000])),pledge:true};break;
        case 1:actor=quest.requesterId;action=random()<0.5?{type:'quest/update',no:quest.no,patch:{title:'무작위 업무 제목 변경'}}:{type:'quest/delete',no:quest.no};break;
        case 2:action={type:'quest/apply',no:quest.no,resolve:'업무 수행에 지원합니다',pledge:true};break;
        case 3:actor=quest.requesterId;action={type:'quest/adopt',no:quest.no,userId:pick(quest.applications)?.userId??'lee'};break;
        case 4:actor=quest.workerId??actor;action={type:'quest/submit',no:quest.no,bodyHtml:'무작위 결과 자료를 검토해서 제출합니다.',attachments:[]};break;
        case 5:actor=quest.requesterId;action=random()<0.25?{type:'quest/reject',no:quest.no,reason:'서식과 내용을 다시 확인해 주세요'}:{type:'quest/approve',no:quest.no,stars:pick([1,2,3,4,5]) as Stars};break;
        case 6:actor='kim';action={type:'daily/claim',mission:pick(['login','post','complete','adopted'] as const)};break;
        case 7:action={type:'item/create',input:itemInput(pick([0,100,300,1000]))};break;
        case 8:{const mode=Math.floor(random()*5);actor=mode===0?actor:market.sellerId;action=mode===0?{type:'item/confirmReceipt',id:market.id}:mode===1?{type:'item/undoReceipt',id:market.id}:mode===2?{type:'item/sellTo',id:market.id,userId:pick(players).id}:mode===3?{type:'item/reserve',id:market.id,userId:pick(players).id}:{type:'item/like',id:market.id};break;}
        case 9:{actor='ops';const target=pick(players).id,existing=activeRestrictions(db,target,now),flag=pick(detectFlags(db,now));action=existing.length?{type:'admin/lift',restrictionId:existing[0]!.id,reason:'소명 자료 확인으로 제재 해제'}:flag&&random()<0.3?{type:'admin/dismissFlag',flagId:flag.id,reason:'의심 활동 소명 자료 확인 완료'}:{type:'admin/restrict',userId:target,kinds:[pick(['quest_post','purchase'] as const)],duration:'1d',reason:'정책 위반 활동 소명 요청'};break;}
        case 10:action={type:pick(['timer/expire','timer/reset','timer/toggle','timer/plus30'] as const)};break;
        default:action={type:'season/reset'};
      }
    }
    // Keep scaffold legal even when random actions restricted the requester or
    // exhausted the timer; restrictions expire at the next 50-step day boundary.
    const before=structuredClone(db),oldTotal=total(db),oldRatings=db.ratings.length;
    let success=false;
    try{db=step(db,action,actor,now);success=true;successes.add(action.type);}
    catch(error){expect(error).toBeInstanceOf(DomainError);expect(db).toEqual(before);}
    const minted=success?(action.type==='quest/approve'?100:action.type==='daily/claim'?10:0):0;
    expect(total(db)-oldTotal,`step ${index} ${action.type}`).toBe(minted);
    expect(db.ratings.length-oldRatings).toBe(success&&action.type==='quest/approve'?1:0);
    for(const u of Object.values(db.users)){
      expect(u.points).toBeGreaterThanOrEqual(0);expect(Number.isInteger(u.points)).toBe(true);
      if(u.role==='player'){
        expect(u.rating.count).toBe(u.completedTotal);
        const records=db.ratings.filter(r=>!seedRatingIds.has(r.id)&&r.workerId===u.id);
        expect(u.rating.count-baseline[u.id]!.rating.count).toBe(records.length);
        expect(u.rating.sum-baseline[u.id]!.rating.sum).toBe(records.reduce((sum,r)=>sum+r.stars,0));
      }else expect(u.points).toBe(0);
    }
    for(const quest of db.quests)expect(quest.escrowHeld).toBe(quest.status==='done'?0:quest.bounty);
    if(success&&action.type==='quest/approve')approvals++;
    if(success&&action.type==='daily/claim')dailyRewards++;
    if(success&&action.type.startsWith('admin/'))adminSuccesses++;
  }
  expect(approvals).toBeGreaterThanOrEqual(5);expect(dailyRewards).toBeGreaterThan(0);expect(adminSuccesses).toBeGreaterThan(0);
  for(const type of ['quest/approve','daily/claim','item/sellTo','admin/restrict'])expect(successes.has(type)).toBe(true);
});
