import { canBrowseQuest, QUEST_TIME_NOTICE } from './quest-access';
import { OUTFITS, validAppearance } from './character';
import { level } from './formulas';
import { BOUNTY_MAX, BOUNTY_STEP, DAILY_COMPLETE_LIMIT, REJECT_LIMIT, VALIDATION, RESTRICTION_DURATIONS } from './constants';
import { plainText } from './format';
import { kstDayKey } from './formulas';
import { activeRestriction, restrictionStatus, restrictionReason } from './restrictions';
import { detectFlags } from './monitoring';
import { DomainError } from './types';
import type { Action, Attachment, DB, DomainErrorCode, ItemInput, QuestInput, UserId, Stars } from './types';
export type GuardResult = {ok:true}|{ok:false;code:DomainErrorCode;reason:string};
const OK:GuardResult={ok:true};
const fail=(code:DomainErrorCode,reason:string):GuardResult=>({ok:false,code,reason});
export const TIMER_REASON='오늘 작업 가능 시간을 모두 사용했어요 (00:00:00)';
export const REJECT_REASON='반려는 퀘스트당 최대 2회예요 · 별점과 함께 승인해 주세요(별 1개도 가능)';
export const DAILY_APPROVE_REASON='작업자의 오늘 완료 한도(2/2) 도달 · 내일 승인할 수 있어요';
export const ADMIN_PLAYER_REASON='운영자 계정은 업무 퀘스트·효성마을 거래에 참여하지 않아요';
const textLength=(s:string,min:number,max=Infinity)=>typeof s==='string'&&s.trim().length>=min&&s.trim().length<=max;
export function validateAttachments(type:QuestInput['type'],files:Attachment[]):GuardResult {if(!Array.isArray(files)||files.some(f=>!f.fileName||!Number.isFinite(f.sizeBytes)||f.sizeBytes<0||(type==='inquiry'?(f.kind!=='image'||!f.dataUrl?.startsWith('data:image/')):!((f.kind==='sharepoint'&&f.url===undefined)||(f.kind==='image'&&f.dataUrl?.startsWith('data:image/'))))))return fail('VALIDATION',type==='inquiry'?'문의는 스크린샷 이미지만 첨부할 수 있어요':'첨부 파일을 확인해 주세요');return OK;}
export function validateQuest(input:QuestInput,points:number):GuardResult {
 if(!input||!['request','inquiry'].includes(input.type)||!textLength(input.title,...VALIDATION.questTitle)||!textLength(input.field,1)||!Number.isFinite(Date.parse(input.dueAt))||plainText(input.bodyHtml??'').length<VALIDATION.questBodyMinText)return fail('VALIDATION','제목, 업무 분야, 마감일과 본문 20자 이상을 입력해 주세요');
 if(!Number.isInteger(input.bounty)||input.bounty<0||input.bounty>BOUNTY_MAX||input.bounty%BOUNTY_STEP!==0)return fail('VALIDATION','현상금은 0~1,000 P, 10 P 단위로 입력해 주세요');
 if(input.bounty>points)return fail('INSUFFICIENT_POINTS','보유 포인트가 부족합니다! 업무 퀘스트를 수행해 포인트를 모아보세요.');
 return validateAttachments(input.type,input.attachments);
}
export function validateItem(input:ItemInput):GuardResult {
 if(!input||!textLength(input.title,...VALIDATION.itemTitle)||!['mapo','hoehyeon','banpo','suseo','changwon','ulsan'].includes(input.village)||!['digital','living','fashion','books','hobby'].includes(input.category)||!['sale','free'].includes(input.mode)||!Array.isArray(input.photos)||input.photos.length>VALIDATION.itemPhotosMax)return fail('VALIDATION','물품 제목, 마을, 분류와 사진을 확인해 주세요');
 if(input.mode==='free'?input.price!==0:(!Number.isInteger(input.price)||input.price<VALIDATION.itemPriceMin||input.price>VALIDATION.itemPriceMax||input.price%VALIDATION.itemPriceStep!==0))return fail('VALIDATION','가격은 10~100,000 P, 10 P 단위로 입력해 주세요');
 return OK;
}
export function canAction(db:DB,action:Action,actorId:UserId,now:number):GuardResult {
 const actor=db.users[actorId]; if(!actor)return fail('FORBIDDEN','등록된 직원만 사용할 수 있어요');
 const isAdmin=actor.role==='admin';const kind=action.type;
 if(action.type==='character/equip'){
  if(!validAppearance(action.appearance))return fail('VALIDATION','캐릭터 외형을 다시 선택해 주세요');
  const outfit=OUTFITS.find(o=>o.id===action.appearance.outfit);
  if(outfit&&level(actor.exp)<outfit.level)return fail('FORBIDDEN',`Lv.${outfit.level}에 해금되는 의상이에요`);
  return OK;
 }
 if(kind.startsWith('admin/')) {
  if(!isAdmin)return fail('FORBIDDEN','운영자만 사용할 수 있어요');
  if(action.type==='admin/restrict') {
   if(!db.users[action.userId]||db.users[action.userId]?.role==='admin')return fail('VALIDATION','플레이어 직원을 선택해 주세요');
   if(!textLength(action.reason,5,100)||!Array.isArray(action.kinds)||!action.kinds.length||action.kinds.some(k=>k!=='quest_post'&&k!=='purchase')||!Object.prototype.hasOwnProperty.call(RESTRICTION_DURATIONS,action.duration))return fail('VALIDATION','제재 종류, 기간과 사유 5~100자를 입력해 주세요');
   if(action.flagId&&!detectFlags(db,now).some(f=>f.id===action.flagId&&f.status==='open'))return fail('INVALID_STATE','열린 플래그만 처리할 수 있어요');
   if(action.kinds.every(k=>activeRestriction(db,action.userId,k,now)))return fail('INVALID_STATE','이미 제재 중이에요');
  } else if(action.type==='admin/lift') {
   const r=db.restrictions.find(r=>r.id===action.restrictionId);
   if(!r||restrictionStatus(r,now)!=='active')return fail('INVALID_STATE','활성 제재만 해제할 수 있어요');
   if(!textLength(action.reason,5,100))return fail('VALIDATION','해제 사유 5~100자를 입력해 주세요');
  } else if(action.type==='admin/dismissFlag') {
   if(!detectFlags(db,now).some(f=>f.id===action.flagId&&f.status==='open'))return fail('INVALID_STATE','열린 플래그만 처리할 수 있어요');
   if(!textLength(action.reason,5,100))return fail('VALIDATION','사유 5~100자를 입력해 주세요');
  }
  return OK;
 }
 if(isAdmin&&((kind.startsWith('quest/')&&kind!=='quest/view')||(kind.startsWith('item/')&&kind!=='item/view')||kind==='daily/claim'))return fail('FORBIDDEN',ADMIN_PLAYER_REASON);
 if(kind==='quest/create') {const r=activeRestriction(db,actorId,'quest_post',now);if(r)return fail('RESTRICTED',restrictionReason(r));}
 if(kind==='item/request'||kind==='item/confirmReceipt') {const r=activeRestriction(db,actorId,'purchase',now);if(r)return fail('RESTRICTED',restrictionReason(r));}
 if((kind==='item/reserve'||kind==='item/sellTo')) {const r=activeRestriction(db,action.userId,'purchase',now);if(r)return fail('RESTRICTED','구매 제한 중인 직원이에요');}
 const newDay=db.dayKey!==kstDayKey(now);
 if((kind==='quest/create'||kind==='quest/apply'||kind==='quest/submit'||kind==='quest/answer')&&!newDay&&db.timer.endsAt<=now)return fail('TIMER_EXPIRED',TIMER_REASON);
 const completed=(id:string)=>newDay?0:db.users[id]?.completedToday??0;
 if(action.type==='quest/create'){if(action.pledge!==true)return fail('PLEDGE_REQUIRED','보안서약서에 동의해 주세요');return validateQuest(action.input,actor.points);}
 if(kind.startsWith('quest/')&&'no' in action) {
  const q=db.quests.find(q=>q.no===action.no);if(!q)return fail('INVALID_STATE','퀘스트를 찾을 수 없어요');
  if(action.type==='quest/view')return canBrowseQuest(db,q,actorId,now)?OK:fail('TIMER_EXPIRED',QUEST_TIME_NOTICE);
  if(action.type==='quest/update'||action.type==='quest/delete') {
   if(q.status!=='recruiting')return fail('INVALID_STATE','진행중·완료 상태에서는 수정/삭제할 수 없어요');
   if(q.requesterId!==actorId)return fail('FORBIDDEN','요청자만 수정·삭제할 수 있어요');
   if(action.type==='quest/update') {if(Object.keys(action.patch).some(k=>!['title','field','dueAt','bodyHtml','attachments'].includes(k)))return fail('VALIDATION','유형과 현상금은 변경할 수 없어요');return validateQuest({...q,...action.patch},Infinity);}
   return OK;
  }
  if(action.type==='quest/answer') {
   if(q.type!=='inquiry'||q.status==='done')return fail('INVALID_STATE','답변을 접수 중인 문의에만 작성할 수 있어요');
   if(q.requesterId===actorId)return fail('FORBIDDEN','본인 문의에는 답변을 등록할 수 없어요');
   if(plainText(action.bodyHtml).length<VALIDATION.resultBodyMinText)return fail('VALIDATION','답변을 10자 이상 입력해 주세요');
   return validateAttachments('inquiry',action.attachments);
  }
  if(action.type==='quest/acceptAnswer') {
   if(q.type!=='inquiry'||q.status==='done')return fail('INVALID_STATE','이미 채택했거나 문의가 아니에요');
   if(q.requesterId!==actorId)return fail('FORBIDDEN','질문자만 답변을 채택할 수 있어요');
   const answer=q.answers?.find(a=>a.id===action.answerId);
   if(!answer||answer.authorId===actorId||db.users[answer.authorId]?.role!=='player')return fail('INVALID_STATE','채택할 답변을 확인해 주세요');
   if(completed(answer.authorId)>=DAILY_COMPLETE_LIMIT)return fail('DAILY_LIMIT',DAILY_APPROVE_REASON);
   return [1,2,3,4,5].includes(action.stars)?OK:fail('RATING_REQUIRED','별점을 선택해야 채택할 수 있어요');
  }
  if(action.type==='quest/apply') {
   if(q.type==='inquiry')return fail('INVALID_STATE','문의에는 지원 대신 답변을 작성해 주세요');
   if(q.requesterId===actorId)return fail('FORBIDDEN','본인 퀘스트에는 지원할 수 없어요');
   if(q.status!=='recruiting')return fail('INVALID_STATE','모집중인 퀘스트만 지원할 수 있어요');
   if(completed(actorId)>=DAILY_COMPLETE_LIMIT)return fail('DAILY_LIMIT','오늘 완료 한도(2/2)에 도달했어요 · 내일 다시 지원할 수 있어요');
   if(q.applications.some(a=>a.userId===actorId))return fail('ALREADY_APPLIED','지원 완료 · 채택 대기');
   if(action.pledge!==true)return fail('PLEDGE_REQUIRED','보안서약서에 동의해 주세요');
   return textLength(action.resolve,...VALIDATION.resolveLine)?OK:fail('VALIDATION','한 줄 각오 1~60자를 입력해 주세요');
  }
  if(action.type==='quest/adopt') {
   if(q.type==='inquiry')return fail('INVALID_STATE','문의는 답변을 채택해 주세요');
   if(q.requesterId!==actorId)return fail('FORBIDDEN','요청자만 채택할 수 있어요');
   return q.status==='recruiting'&&!q.workerId&&q.applications.some(a=>a.userId===action.userId)&&db.users[action.userId]?.role==='player'?OK:fail('INVALID_STATE','지원자 한 명을 채택해 주세요');
  }
  if(action.type==='quest/submit') {
   if(q.workerId!==actorId)return fail('FORBIDDEN','채택된 작업자만 제출할 수 있어요');
   if(!['in_progress','revision'].includes(q.status)||q.reviewPending)return fail('INVALID_STATE','검수 대기 중이에요');
   if(plainText(action.bodyHtml).length<VALIDATION.resultBodyMinText)return fail('VALIDATION','결과물을 10자 이상 입력해 주세요');
   return validateAttachments(q.type,action.attachments);
  }
  if(action.type==='quest/reject'||action.type==='quest/approve') {
   if(q.requesterId!==actorId)return fail('FORBIDDEN','요청자만 검수할 수 있어요');
   if(q.status!=='in_progress'||!q.reviewPending||!q.workerId||!q.submissions.length)return fail('INVALID_STATE','제출된 결과물이 있어야 검수할 수 있어요');
   if(action.type==='quest/reject') {if(q.rejectCount>=REJECT_LIMIT)return fail('REJECT_LIMIT',REJECT_REASON);return textLength(action.reason,VALIDATION.rejectReasonMin)?OK:fail('VALIDATION','반려 사유를 5자 이상 입력해 주세요');}
   if(completed(q.workerId)>=DAILY_COMPLETE_LIMIT)return fail('DAILY_LIMIT',DAILY_APPROVE_REASON);
   return [1,2,3,4,5].includes(action.stars)?OK:fail('RATING_REQUIRED','별점을 선택해야 승인할 수 있어요');
  }
 }
 if(action.type==='daily/claim') {const d=db.daily[actorId];return !newDay&&d?.achieved[action.mission]&&!d.claimed[action.mission]?OK:fail('INVALID_STATE','달성한 미수령 미션만 보상을 받을 수 있어요');}
 if(action.type==='item/create')return validateItem(action.input);
 if(kind.startsWith('item/')&&'id' in action) {
  const item=db.items.find(i=>i.id===action.id);if(!item)return fail('INVALID_STATE','물품을 찾을 수 없어요');
  if(action.type==='item/view'||action.type==='item/like')return OK;
  if(action.type==='item/undoReceipt') {
   if(item.status!=='sold'||!item.receipt||item.receipt.buyerId!==actorId||item.buyerId!==actorId)return fail('FORBIDDEN','직접 완료한 거래만 되돌릴 수 있어요');
   if((db.users[item.sellerId]?.points??0)<item.receipt.price)return fail('INSUFFICIENT_POINTS','판매자가 정산 포인트를 사용해 지금은 되돌릴 수 없어요');
   const receipt=item.receipt;
   if(!db.transactions.some(t=>t.id===receipt.purchaseTxId&&!t.reversedAt)||!db.transactions.some(t=>t.id===receipt.saleTxId&&!t.reversedAt))return fail('INVALID_STATE','이미 되돌린 거래예요');
   return OK;
  }
  if(item.status==='sold')return fail('INVALID_STATE','거래가 완료된 상품이에요');
  if(action.type==='item/request'||action.type==='item/approveRequest'||action.type==='item/declineRequest')return fail('INVALID_STATE','판매자가 최종 구매자를 지정한 뒤 구매자가 거래를 완료해 주세요');
  if(action.type==='item/confirmReceipt') {
   if(item.sellerId===actorId)return fail('FORBIDDEN','판매자는 구매할 수 없어요');
   if(item.finalBuyerId!==actorId)return fail('NOT_RESERVED_BUYER','판매자가 지정한 최종 구매자만 거래를 완료할 수 있어요');
   return actor.points>=item.price?OK:fail('INSUFFICIENT_POINTS','보유 포인트가 부족합니다! 업무 퀘스트를 수행해 포인트를 모아보세요.');
  }
  if(item.sellerId!==actorId)return fail('FORBIDDEN','판매자만 변경할 수 있어요');
  if(action.type==='item/reserve'||action.type==='item/sellTo') {
   const buyer=db.users[action.userId];if(!buyer||buyer.role!=='player'||action.userId===actorId)return fail('VALIDATION','다른 플레이어 직원을 선택해 주세요');
   return OK;
  }
  if(action.type==='item/releaseReservation')return item.status==='reserved'?OK:fail('INVALID_STATE','예약중인 상품만 예약 해제할 수 있어요');
  if(action.type==='item/update'){if(Object.keys(action.patch).some(k=>!['title','village','category','mode','price','bodyHtml','photos'].includes(k)))return fail('VALIDATION','수정할 수 없는 물품 정보예요');return validateItem({...item,...action.patch});}
  return OK;
 }
 if(action.type==='teams/send'||action.type==='teams/reply') {
  const t=db.teams[action.threadKey];if(!t||!t.participants.includes(actorId))return fail('FORBIDDEN','대화 참여자만 사용할 수 있어요');
  if(action.type==='teams/send')return textLength(action.text,1)&&!t.pendingReplyFor?OK:fail('INVALID_STATE','답장을 기다리거나 메시지를 입력해 주세요');
  return t.pendingReplyFor?OK:fail('INVALID_STATE','응답할 메시지가 없어요');
 }
 return OK;
}
export function assertCanAction(db:DB,action:Action,actor:UserId,now:number):void {const g=canAction(db,action,actor,now);if(!g.ok)throw new DomainError(g.code,g.reason);}
export const canCreateQuest = (db:DB,actor:UserId,input:QuestInput,now:number):GuardResult=>canAction(db,{type:'quest/create',input,pledge:true},actor,now);
export const canApply = (db:DB,actor:UserId,no:number,now:number):GuardResult=>canAction(db,{type:'quest/apply',no,resolve:'지원합니다',pledge:true},actor,now);
export const canAdopt = (db:DB,actor:UserId,no:number,userId:UserId,now:number):GuardResult=>canAction(db,{type:'quest/adopt',no,userId},actor,now);
export const canApprove = (db:DB,actor:UserId,no:number,now:number,stars:Stars=3):GuardResult=>canAction(db,{type:'quest/approve',no,stars},actor,now);
export const canReject = (db:DB,actor:UserId,no:number,now:number):GuardResult=>canAction(db,{type:'quest/reject',no,reason:'보완 부탁드립니다'},actor,now);
export const canSubmit = (db:DB,actor:UserId,no:number,now:number):GuardResult=>canAction(db,{type:'quest/submit',no,bodyHtml:'결과물을 작성하여 제출합니다.',attachments:[]},actor,now);
export const canPurchase = (db:DB,actor:UserId,id:string,now:number):GuardResult=>canAction(db,{type:'item/confirmReceipt',id},actor,now);
export const canReserve = (db:DB,actor:UserId,id:string,userId:UserId,now:number):GuardResult=>canAction(db,{type:'item/reserve',id,userId},actor,now);
export const canSellTo = (db:DB,actor:UserId,id:string,userId:UserId,now:number):GuardResult=>canAction(db,{type:'item/sellTo',id,userId},actor,now);
export const canEditQuest=(db:DB,actor:UserId,no:number,now:number):GuardResult=>canAction(db,{type:'quest/update',no,patch:{}},actor,now);
export type BuyState='sold'|'restricted'|'buy'|'seller'|'hidden'|'received';
export function getBuyState(db:DB,id:string,actor:string,now:number):BuyState {
 const i=db.items.find(i=>i.id===id);if(!i||db.users[actor]?.role!=='player')return 'hidden';
 if(i.sellerId===actor)return 'seller';
 if(i.status==='sold')return i.buyerId===actor&&i.receipt?.buyerId===actor?'received':'sold';
 if(i.finalBuyerId!==actor)return 'hidden';
 return activeRestriction(db,actor,'purchase',now)?'restricted':'buy';
}

export const canPostQuest = (db:DB,actor:UserId,now:number):GuardResult=>canAction(db,{type:'quest/create',input:{type:'request',title:'업무 요청',field:'기타',dueAt:new Date(now).toISOString(),bodyHtml:'업무 퀘스트 등록 가능 여부를 확인하는 내용입니다.',attachments:[],bounty:0},pledge:true},actor,now);
