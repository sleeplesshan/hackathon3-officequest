import { expect, it } from 'vitest';
import { canAction, canAdopt, canApply, canApprove, canCreateQuest, canEditQuest, canPurchase, canReject, canReserve, canSellTo, canSubmit } from '@/lib/guards';
import { DomainError } from '@/lib/types';
import { loadScenario } from '@/lib/db/scenarios';
import { NOW, fails, pending, questInput, seed, step } from './domain-fixtures';
import type { Action, DB } from '@/lib/types';

it('all canX helpers return same verdict as canonical canAction',()=>{
  const db=seed();const tests:[Action,ReturnType<typeof canAction>][]=[
    [{type:'quest/create',input:questInput(),pledge:true},canCreateQuest(db,'kim',questInput(),NOW)],
    [{type:'quest/apply',no:7,resolve:'지원합니다',pledge:true},canApply(db,'kim',7,NOW)],
    [{type:'quest/adopt',no:7,userId:'lee'},canAdopt(db,'kim',7,'lee',NOW)],
    [{type:'quest/approve',no:7,stars:3},canApprove(db,'kim',7,NOW)],
    [{type:'quest/reject',no:7,reason:'보완 부탁드립니다'},canReject(db,'kim',7,NOW)],
    [{type:'quest/submit',no:7,bodyHtml:'결과물을 작성하여 제출합니다.',attachments:[]},canSubmit(db,'kim',7,NOW)],
    [{type:'quest/update',no:7,patch:{}},canEditQuest(db,'kim',7,NOW)],
    [{type:'item/confirmReceipt',id:'m4'},canPurchase(db,'kim','m4',NOW)],
    [{type:'item/reserve',id:'m1',userId:'park'},canReserve(db,'kim','m1','park',NOW)],
    [{type:'item/sellTo',id:'m1',userId:'park'},canSellTo(db,'kim','m1','park',NOW)],
  ];for(const [action,guard] of tests)expect(guard).toEqual(canAction(db,action,'kim',NOW));
});
it('canAction and reducer agree on success or exact DomainError code across representative states/actions',()=>{
  const actions:Action[]=[{type:'quest/create',input:questInput(),pledge:true},{type:'quest/apply',no:7,resolve:'지원합니다',pledge:true},{type:'quest/adopt',no:7,userId:'lee'},{type:'quest/submit',no:7,bodyHtml:'작업 결과를 작성하여 제출합니다.',attachments:[]},{type:'quest/reject',no:7,reason:'검토 사항 보완 부탁드립니다'},{type:'quest/approve',no:7,stars:3},{type:'quest/update',no:7,patch:{title:'업무 제목 수정'}},{type:'quest/delete',no:7},{type:'quest/view',no:7},{type:'daily/claim',mission:'login'},{type:'item/request',id:'m1'},{type:'item/approveRequest',id:'m1'},{type:'item/reserve',id:'m1',userId:'lee'},{type:'item/sellTo',id:'m1',userId:'park'},{type:'item/update',id:'m1',patch:{price:20}},{type:'item/delete',id:'m1'},{type:'item/like',id:'m1'},{type:'admin/restrict',userId:'kim',kinds:['purchase'],duration:'1d',reason:'정책 확인을 위한 소명 요청'},{type:'admin/dismissFlag',flagId:'fast_high_bounty__A-107',reason:'정상 업무 근거 확인 완료'},{type:'admin/lift',restrictionId:'r1',reason:'과거 제재 해제 요청 확인'}];
  const states:DB[]=[seed(),pending(),step(seed(),{type:'timer/expire'}),loadScenario('rejectLimit',NOW),loadScenario('limitApprove',NOW),step(seed(),{type:'item/sellTo',id:'m1',userId:'park'},'kim')];
  let checked=0;
  for(const db of states)for(const actor of ['kim','lee','park','ops'])for(const action of actions){
    const before=structuredClone(db),guard=canAction(db,action,actor,NOW);
    if(guard.ok){let error:unknown;try{step(db,action,actor);}catch(e){error=e;}expect(error,`${actor} ${action.type} guard ok`).toBeUndefined();}
    else {try{step(db,action,actor);expect.fail(`${action.type} accepted rejected guard`);}catch(error){expect(error).toBeInstanceOf(DomainError);expect((error as DomainError).code).toBe(guard.code);}}
    expect(db).toEqual(before);checked++;
  }expect(checked).toBe(480);
});
it('unknown actor and missing references reject immutable',()=>{
  fails(seed(),{type:'quest/view',no:7},'unknown','FORBIDDEN');fails(seed(),{type:'quest/view',no:999},'kim','INVALID_STATE');fails(seed(),{type:'item/request',id:'missing'},'kim','INVALID_STATE');
});
