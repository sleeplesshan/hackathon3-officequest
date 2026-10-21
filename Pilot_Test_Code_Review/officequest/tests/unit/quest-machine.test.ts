import { describe, expect, it } from 'vitest';
import { canApprove, canReject } from '@/lib/guards';
import { loadScenario } from '@/lib/db/scenarios';
import { DAY, NOW, fails, pending, q, questInput, seed, step } from './domain-fixtures';
import type { Action, QuestInput } from '@/lib/types';

describe('PRD §7.1 every quest state-machine row',()=>{
  it('create → recruiting: escrow, Tx, daily post and pledge timestamp',()=>{
    const before=seed(),after=step(before,{type:'quest/create',input:questInput(),pledge:true});
    expect(q(after,8)).toMatchObject({status:'recruiting',requesterId:'kim',bounty:300,escrowHeld:300,applications:[],workerId:null,submissions:[],reviewPending:false,rejectCount:0,rating:null});
    expect(after.users.kim!.points).toBe(1200);expect(before.users.kim!.points).toBe(1500);expect(after.daily.kim!.achieved.post).toBe(true);
    expect(after.transactions.at(-1)).toMatchObject({type:'bounty_escrow',amount:-300,userId:'kim',balanceAfter:1200,refId:'8'});
    expect(Date.parse(q(after,8).pledgeAgreedAt)).toBe(NOW);expect(after.counters.nextQuestNo).toBe(9);
  });
  it('recruiting update: only requester can edit and bounty/type remain fixed',()=>{
    const db=seed(),after=step(db,{type:'quest/update',no:7,patch:{title:'수정된 업무 제목',bodyHtml:questInput().bodyHtml}});
    expect(q(after).title).toBe('수정된 업무 제목');expect(q(after).bounty).toBe(300);expect(q(after).type).toBe('request');
    fails(db,{type:'quest/update',no:7,patch:{title:'타인 수정'}},'lee','FORBIDDEN');
    fails(db,{type:'quest/update',no:7,patch:{bounty:500}} as unknown as Action,'kim','VALIDATION');
    fails(db,{type:'quest/update',no:7,patch:{type:'inquiry'}} as unknown as Action,'kim','VALIDATION');
  });
  it('recruiting delete: requester receives 100% escrow refund and quest is removed',()=>{
    const before=seed(),after=step(before,{type:'quest/delete',no:7});
    expect(after.quests.some(x=>x.no===7)).toBe(false);expect(after.users.kim!.points).toBe(1800);expect(after.transactions.at(-1)).toMatchObject({type:'bounty_refund',amount:300,balanceAfter:1800});
    fails(before,{type:'quest/delete',no:7},'lee','FORBIDDEN');
  });
  it('zero-bounty create/delete produces no escrow or refund Tx',()=>{
    const db=seed(),created=step(db,{type:'quest/create',input:questInput(0),pledge:true});
    expect(created.transactions).toHaveLength(db.transactions.length);expect(q(created,8).escrowHeld).toBe(0);
    const after=step(created,{type:'quest/delete',no:8});expect(after.users.kim!.points).toBe(1500);expect(after.transactions).toHaveLength(db.transactions.length);
  });
  it('recruiting apply: adds one application and requires pledge, nonself, available daily quota',()=>{
    const db=seed();q(db,3).type='request';const after=step(db,{type:'quest/apply',no:3,resolve:'끝까지 꼼꼼하게 처리하겠습니다',pledge:true},'lee');
    expect(q(after,3).status).toBe('recruiting');expect(q(after,3).applications).toHaveLength(1);
    expect(q(after,3).applications[0]).toMatchObject({userId:'lee',resolve:'끝까지 꼼꼼하게 처리하겠습니다'});expect(Date.parse(q(after,3).applications[0]!.pledgeAgreedAt)).toBe(NOW);
    fails(after,{type:'quest/apply',no:3,resolve:'재지원',pledge:true},'lee','ALREADY_APPLIED');
    fails(db,{type:'quest/apply',no:7,resolve:'지원',pledge:true},'kim','FORBIDDEN');
    fails(db,{type:'quest/apply',no:7,resolve:'지원',pledge:true},'park','DAILY_LIMIT');
    fails(db,{type:'quest/apply',no:3,resolve:'지원',pledge:false} as unknown as Action,'lee','PLEDGE_REQUIRED');
  });
  it('recruiting adopt → in_progress: locks edits, records worker and daily adopted, notifies',()=>{
    const db=step(seed(),{type:'quest/adopt',no:7,userId:'lee'});
    expect(q(db)).toMatchObject({status:'in_progress',workerId:'lee'});expect(Date.parse(q(db).adoptedAt!)).toBe(NOW);expect(db.daily.lee!.achieved.adopted).toBe(true);
    expect(db.notifications.at(-1)).toMatchObject({userId:'lee',kind:'adopted',refId:'7'});
    fails(seed(),{type:'quest/adopt',no:7,userId:'han'},'kim','INVALID_STATE');fails(seed(),{type:'quest/adopt',no:7,userId:'lee'},'lee','FORBIDDEN');
    fails(db,{type:'quest/adopt',no:7,userId:'jung'},'kim','INVALID_STATE');
  });
  it('in_progress submit (pending=false) → pending=true: v1; only adopted worker',()=>{
    const db=pending();expect(q(db)).toMatchObject({status:'in_progress',reviewPending:true});expect(q(db).submissions).toHaveLength(1);expect(q(db).submissions[0]?.version).toBe(1);
    fails(seed(),{type:'quest/submit',no:7,bodyHtml:'작업 결과를 작성하여 제출합니다.',attachments:[]},'lee','FORBIDDEN');
    fails(db,{type:'quest/submit',no:7,bodyHtml:'작업 결과를 작성하여 제출합니다.',attachments:[]},'lee','INVALID_STATE');
  });
  it('pending reject → revision: review, reason, counter and notification; revision submit → in_progress v2',()=>{
    let db=step(pending(),{type:'quest/reject',no:7,reason:'원본 시트 서식을 다시 맞춰 주세요'});
    expect(q(db)).toMatchObject({status:'revision',reviewPending:false,rejectCount:1});expect(q(db).submissions[0]?.review).toMatchObject({result:'rejected',reason:'원본 시트 서식을 다시 맞춰 주세요'});
    expect(db.notifications.at(-1)).toMatchObject({kind:'rejected',userId:'lee'});
    db=step(db,{type:'quest/submit',no:7,bodyHtml:'요청하신 서식과 데이터를 모두 보완했습니다.',attachments:[]},'lee');
    expect(q(db)).toMatchObject({status:'in_progress',reviewPending:true,rejectCount:1});expect(q(db).submissions.map(s=>s.version)).toEqual([1,2]);
  });
  it('pending approve → done: completion, settlement, rating and daily complete',()=>{
    const before=pending(),db=step(before,{type:'quest/approve',no:7,stars:3});
    expect(q(db)).toMatchObject({status:'done',reviewPending:false,escrowHeld:0,rating:{stars:3}});expect(Date.parse(q(db).completedAt!)).toBe(NOW);
    expect(db.users.lee).toMatchObject({points:700,exp:750,completedToday:2,completedTotal:9,rating:{sum:36,count:9}});expect(db.daily.lee!.achieved.complete).toBe(true);
    expect(db.transactions.at(-1)).toMatchObject({type:'quest_reward',amount:400,userId:'lee',balanceAfter:700});expect(db.notifications.at(-1)).toMatchObject({kind:'approved',userId:'lee'});
  });
  it.each(['in_progress','revision','done'] as const)('%s update/delete reject with INVALID_STATE',status=>{
    const db=seed(),target=db.quests.find(x=>x.status===status)!;
    fails(db,{type:'quest/update',no:target.no,patch:{title:'편집할 수 없음'}},target.requesterId,'INVALID_STATE');fails(db,{type:'quest/delete',no:target.no},target.requesterId,'INVALID_STATE');
  });
  it.each([7,5,4,2])('all states quest/view no=%i increments views for anyone',no=>{
    const db=seed(),after=step(db,{type:'quest/view',no},'ops');expect(q(after,no).views).toBe(q(db,no).views+1);expect(q(after,no).status).toBe(q(db,no).status);
  });
});

describe('quest boundaries, limits and legal final paths',()=>{
  it.each([-10,1,1010,1500])('invalid bounty %i is VALIDATION',bounty=>fails(seed(),{type:'quest/create',input:questInput(bounty),pledge:true},'kim','VALIDATION'));
  it('bounty equal to current balance is allowed; excess is insufficient and DB stays unchanged',()=>{
    const db=seed();expect(step(db,{type:'quest/create',input:questInput(300),pledge:true},'lee').users.lee!.points).toBe(0);
    fails(db,{type:'quest/create',input:questInput(310),pledge:true},'lee','INSUFFICIENT_POINTS');
  });
  it('quest create requires pledge and accepts title endpoints 2 and 60, bounty endpoints 0 and 1000',()=>{
    fails(seed(),{type:'quest/create',input:questInput(),pledge:false} as unknown as Action,'kim','PLEDGE_REQUIRED');
    for(const [length,bounty] of [[2,0],[60,1000]])expect(q(step(seed(),{type:'quest/create',input:{...questInput(bounty),title:'가'.repeat(length!)},pledge:true}),8).bounty).toBe(bounty);
  });
  it.each([{title:'a'},{title:'a'.repeat(61)},{bodyHtml:'<b>짧음</b>'},{field:''},{dueAt:'invalid'}])('quest input validation rejects %j',patch=>fails(seed(),{type:'quest/create',input:{...questInput(),...patch},pledge:true},'kim','VALIDATION'));
  it('inquiry permits images only; request permits SharePoint and inline screenshots',()=>{
    const invalid={id:'f',kind:'sharepoint',fileName:'보고서.xlsx',sizeBytes:123,url:'https://hyosung.sharepoint.com/x'} as const;
    fails(seed(),{type:'quest/create',input:{...questInput(),type:'inquiry',attachments:[invalid]},pledge:true},'kim','VALIDATION');
    const image={id:'i',kind:'image',fileName:'화면.png',sizeBytes:123,dataUrl:'data:image/png;base64,AA=='} as const;
    expect(step(seed(),{type:'quest/create',input:{...questInput(),type:'inquiry',attachments:[image]},pledge:true}).quests).toHaveLength(8);
    expect(step(seed(),{type:'quest/create',input:{...questInput(),attachments:[image]} as QuestInput,pledge:true}).quests).toHaveLength(8);
  });
  it('expired timer blocks only create/apply/submit, still permits adopt/reject/approve/read',()=>{
    const expired=step(seed(),{type:'timer/expire'});
    fails(expired,{type:'quest/create',input:questInput(),pledge:true},'kim','TIMER_EXPIRED');fails(expired,{type:'quest/apply',no:3,resolve:'지원',pledge:true},'lee','TIMER_EXPIRED');
    let db=step(expired,{type:'quest/adopt',no:7,userId:'lee'});fails(db,{type:'quest/submit',no:7,bodyHtml:'결과를 완성해서 제출합니다.',attachments:[]},'lee','TIMER_EXPIRED');
    db=step(pending(),{type:'timer/expire'});expect(step(db,{type:'quest/reject',no:7,reason:'서식을 다시 맞춰 주세요'}).quests.find(x=>x.no===7)?.status).toBe('revision');
    expect(step(db,{type:'quest/approve',no:7,stars:3}).quests.find(x=>x.no===7)?.status).toBe('done');
  });
  it('review requires pending result; short result/rejection and wrong reviewer are rejected',()=>{
    const adopted=step(seed(),{type:'quest/adopt',no:7,userId:'lee'});
    fails(adopted,{type:'quest/approve',no:7,stars:3},'kim','INVALID_STATE');fails(adopted,{type:'quest/submit',no:7,bodyHtml:'짧은 내용',attachments:[]},'lee','VALIDATION');
    fails(pending(),{type:'quest/reject',no:7,reason:'1234'},'kim','VALIDATION');fails(pending(),{type:'quest/approve',no:7,stars:3},'jung','FORBIDDEN');
  });
  it('rejectCount increases 1 then 2; third reject REJECT_LIMIT; resubmit and one-star approve remain possible',()=>{
    let db=pending();
    for(let count=1;count<=2;count++){
      db=step(db,{type:'quest/reject',no:7,reason:'결과를 다시 확인하고 보완해 주세요'});expect(q(db).rejectCount).toBe(count);
      db=step(db,{type:'quest/submit',no:7,bodyHtml:'보완 내용을 다시 작성하여 제출합니다.',attachments:[]},'lee');
    }
    fails(db,{type:'quest/reject',no:7,reason:'결과를 다시 확인해 주세요'},'kim','REJECT_LIMIT');expect(q(step(db,{type:'quest/approve',no:7,stars:1})).status).toBe('done');
  });
  it('rejectLimit fixture: one star gives lee EXP 700, points 700, rating 3.8/9',()=>{
    const db=step(loadScenario('rejectLimit',NOW),{type:'quest/approve',no:7,stars:1});expect(db.users.lee).toMatchObject({exp:700,points:700,rating:{sum:34,count:9}});
  });
  it('reject 2/2 + daily 2/2: approve DAILY_LIMIT, reject REJECT_LIMIT, next KST day approval legal',()=>{
    const db=loadScenario('rejectLimit',NOW);db.users.lee!.completedToday=2;
    expect(canApprove(db,'kim',7,NOW)).toMatchObject({ok:false,code:'DAILY_LIMIT',reason:'작업자의 오늘 완료 한도(2/2) 도달 · 내일 승인할 수 있어요'});
    expect(canReject(db,'kim',7,NOW)).toMatchObject({ok:false,code:'REJECT_LIMIT'});expect(canApprove(db,'kim',7,NOW+DAY)).toEqual({ok:true});
    expect(q(step(db,{type:'quest/approve',no:7,stars:1},'kim',NOW+DAY)).status).toBe('done');
  });
  it('daily claim pays 10P/50EXP once and unachieved missions reject',()=>{
    const db=step(seed(),{type:'quest/create',input:questInput(0),pledge:true}),after=step(db,{type:'daily/claim',mission:'post'});
    expect(after.users.kim).toMatchObject({points:1510,exp:1218});expect(after.daily.kim!.claimed.post).toBe(true);expect(after.transactions.at(-1)).toMatchObject({type:'daily_reward',amount:10});
    fails(after,{type:'daily/claim',mission:'post'},'kim','INVALID_STATE');fails(seed(),{type:'daily/claim',mission:'complete'},'kim','INVALID_STATE');
  });
});
