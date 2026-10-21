import { DAILY_MISSION_REWARD_EXP, DAILY_MISSION_REWARD_P, NEXT_SEASON_DAYS, QUEST_BASE_REWARD_P, RATING_EXP, RESTRICTION_DURATIONS, SESSION_TIMER_MS, TIMER_PLUS_MS } from '../constants';
import { assertCanAction } from '../guards';
import { kstDayKey, toISO } from '../formulas';
import { detectFlags } from '../monitoring';
import { activeRestriction } from '../restrictions';
import { replyForThread, threadKey } from '../teams-replies';
import { DomainError } from '../types';
import type { Action, AppNotification, DB, MarketItem, RestrictionKind, TeamsThread, Transaction, UserId } from '../types';
import { blankDaily, getSeed } from './seed';
export function ensureDay(db:DB,now:number):DB {
 const dayKey=kstDayKey(now);if(db.dayKey===dayKey)return db;
 const next=structuredClone(db);next.dayKey=dayKey;next.timer.endsAt=now+SESSION_TIMER_MS;
 for(const user of Object.values(next.users)){user.completedToday=0;next.daily[user.id]=blankDaily(dayKey);}
 return next;
}
export function activatePersona(db:DB,actorId:UserId,now:number):DB {
 const day=ensureDay(db,now);const user=day.users[actorId];if(!user||user.role==='admin'||day.daily[actorId]?.achieved.login)return day;
 const next=day===db?structuredClone(day):day;next.daily[actorId]??=blankDaily(next.dayKey);next.daily[actorId]!.achieved.login=true;return next;
}
export function ensureThread(db:DB,context:TeamsThread['context'],refId:string,a:UserId,b:UserId,now:number):DB {
 const key=threadKey(context,refId,a,b);if(db.teams[key])return db;
 if(a===b||!db.users[a]||!db.users[b]||db.users[a]?.role==='admin'||db.users[b]?.role==='admin')throw new DomainError('FORBIDDEN','플레이어 간 대화만 사용할 수 있어요');
 const quest=db.quests.find(q=>String(q.no)===refId);const item=db.items.find(i=>i.id===refId);
 if(context==='handover'?(!quest||!quest.workerId||quest.status==='recruiting'||![a,b].includes(quest.requesterId)||![a,b].includes(quest.workerId)):(!item||![a,b].includes(item.sellerId)))throw new DomainError('FORBIDDEN','대화 참여자를 확인해 주세요');
 const next=structuredClone(db);next.teams[key]={key,context,refId,participants:[a,b].sort() as [UserId,UserId],messages:[{id:`msg${next.counters.nextId++}`,from:'system',text:`${context==='handover'?'업무 인수인계':'중고거래'} · ${context==='handover'?quest!.title:item!.title}`,at:toISO(now)}],pendingReplyFor:null};return next;
}
export function applyAction(db:DB,action:Action,actorId:UserId,now:number):DB {
 assertCanAction(db,action,actorId,now);
 if(action.type==='debug/resetData')return getSeed(now);
 const next=structuredClone(ensureDay(db,now));const at=toISO(now);const actor=next.users[actorId]!;
 const id=(prefix:string)=>`${prefix}${next.counters.nextId++}`;
 const tx=(type:Transaction['type'],userId:string,amount:number,refType:Transaction['refType'],refId:string,memo:string,counterpartyId?:string)=>{amount=amount===0?0:amount;const user=next.users[userId]!;user.points+=amount;const record:Transaction={id:`t${next.counters.nextTxNo++}`,type,userId,amount,balanceAfter:user.points,refType,refId,memo,at,...counterpartyId?{counterpartyId}:{}};next.transactions.push(record);return record;};
 const notify=(userId:string,kind:AppNotification['kind'],refId:string,text:string)=>next.notifications.push({id:id('n'),userId,kind,refId,text,at,read:false});
 const achieved=(userId:string,mission:keyof DB['daily'][string]['achieved'])=>{next.daily[userId]??=blankDaily(next.dayKey);next.daily[userId]!.achieved[mission]=true;};
 const settle=(item:MarketItem,buyerId:string)=>{
  const purchase=tx('market_purchase',buyerId,-item.price,'item',item.id,item.title,item.sellerId),sale=tx('market_sale',item.sellerId,item.price,'item',item.id,item.title,buyerId);
  item.receipt={purchaseTxId:purchase.id,saleTxId:sale.id,buyerId,price:item.price};item.status='sold';item.buyerId=buyerId;item.soldAt=at;item.reservedFor=null;item.pendingRequest=null;
  notify(item.sellerId,'purchase_approved',item.id,'구매자가 수령을 확인해 거래가 완료되었어요');
 };
 const completeQuest=(q:DB['quests'][number],stars:1|2|3|4|5)=>{
  const worker=next.users[q.workerId!]!;
  q.submissions[q.submissions.length-1]!.review={result:'approved',reviewedAt:at};q.status='done';q.reviewPending=false;q.completedAt=at;q.rating={stars,ratedAt:at};q.escrowHeld=0;
  tx('quest_reward',worker.id,QUEST_BASE_REWARD_P+q.bounty,'quest',String(q.no),'퀘스트 완료 보상',q.requesterId);worker.exp+=RATING_EXP[stars];worker.completedToday++;worker.completedTotal++;worker.rating.sum+=stars;worker.rating.count++;
  next.ratings.push({id:id('rating'),questRef:String(q.no),archived:false,requesterId:q.requesterId,workerId:worker.id,stars,bounty:q.bounty,postedAt:q.createdAt,approvedAt:at});achieved(worker.id,'complete');notify(worker.id,'approved',String(q.no),'답변 또는 결과물이 채택되어 보상이 지급되었어요');
 };

 const log=(action:'restrict'|'lift'|'dismiss_flag',targetUserId:string|null,restrictionId:string|null,flagId:string|null,summary:string)=>next.adminLog.push({id:`L${next.counters.nextLogNo++}`,at,actorId,action,targetUserId,restrictionId,flagId,summary});
 const flagState=(flagId:string,status:'actioned'|'dismissed',note:string)=>{const flag=detectFlags(db,now).find(f=>f.id===flagId)!;next.flagStates[flagId]={status,by:actorId,at,note,lastAt:flag.lastAt,evidenceCount:flag.evidence.length};};
 switch(action.type) {
  case 'character/equip':actor.appearance=structuredClone(action.appearance);break;
  case 'quest/create': {
   const no=next.counters.nextQuestNo++;const q={...structuredClone(action.input),no,status:'recruiting' as const,requesterId:actorId,escrowHeld:action.input.bounty,applications:[],workerId:null,adoptedAt:null,submissions:[],reviewPending:false,rejectCount:0,rating:null,views:0,createdAt:at,completedAt:null,pledgeAgreedAt:at};
   next.quests.unshift(q);if(q.bounty>0)tx('bounty_escrow',actorId,-q.bounty,'quest',String(no),'현상금 에스크로');achieved(actorId,'post');break;
  }
  case 'quest/update':Object.assign(next.quests.find(q=>q.no===action.no)!,structuredClone(action.patch));break;
  case 'quest/delete': {const q=next.quests.find(q=>q.no===action.no)!;if(q.escrowHeld>0)tx('bounty_refund',actorId,q.escrowHeld,'quest',String(q.no),'현상금 전액 환불');next.quests=next.quests.filter(q=>q.no!==action.no);break;}
  case 'quest/view':next.quests.find(q=>q.no===action.no)!.views++;break;
  case 'quest/apply':next.quests.find(q=>q.no===action.no)!.applications.push({userId:actorId,resolve:action.resolve.trim(),appliedAt:at,pledgeAgreedAt:at});break;
  case 'quest/adopt': {const q=next.quests.find(q=>q.no===action.no)!;q.status='in_progress';q.workerId=action.userId;q.adoptedAt=at;achieved(action.userId,'adopted');notify(action.userId,'adopted',String(q.no),'지원한 퀘스트에 채택되었어요');break;}
  case 'quest/submit': {const q=next.quests.find(q=>q.no===action.no)!;q.submissions.push({version:q.submissions.length+1,bodyHtml:action.bodyHtml,attachments:structuredClone(action.attachments),submittedAt:at});q.status='in_progress';q.reviewPending=true;break;}
  case 'quest/reject': {const q=next.quests.find(q=>q.no===action.no)!;q.submissions[q.submissions.length-1]!.review={result:'rejected',reason:action.reason.trim(),reviewedAt:at};q.rejectCount++;q.status='revision';q.reviewPending=false;notify(q.workerId!,'rejected',String(q.no),`보완 요청: ${action.reason.trim()}`);break;}
  case 'quest/answer': {const q=next.quests.find(q=>q.no===action.no)!;(q.answers??=[]).push({id:id('answer'),authorId:actorId,bodyHtml:action.bodyHtml,attachments:structuredClone(action.attachments),createdAt:at});break;}
  case 'quest/acceptAnswer': {
   const q=next.quests.find(q=>q.no===action.no)!,answer=q.answers!.find(a=>a.id===action.answerId)!;
   q.workerId=answer.authorId;q.adoptedAt=at;q.acceptedAnswerId=answer.id;q.submissions=[{version:1,bodyHtml:answer.bodyHtml,attachments:structuredClone(answer.attachments),submittedAt:answer.createdAt}];
   achieved(answer.authorId,'adopted');completeQuest(q,action.stars);break;
  }
  case 'quest/approve':completeQuest(next.quests.find(q=>q.no===action.no)!,action.stars);break;
  case 'daily/claim':next.daily[actorId]!.claimed[action.mission]=true;tx('daily_reward',actorId,DAILY_MISSION_REWARD_P,'daily',action.mission,'일일 미션 보상');actor.exp+=DAILY_MISSION_REWARD_EXP;break;
  case 'season/reset': {const old=next.season;for(const u of Object.values(next.users)){u.exp=0;if(!u.seasonBadges.includes(old.label))u.seasonBadges.push(old.label);}const year=kstDayKey(now).slice(0,4);next.season={id:old.id+1,label:`${year} Season ${old.id+1}`,startsAt:at,endsAt:`${kstDayKey(now+NEXT_SEASON_DAYS*86400000)}T23:59:59+09:00`};break;}
  case 'timer/expire':next.timer.endsAt=now;break;
  case 'timer/reset':next.timer.endsAt=now+SESSION_TIMER_MS;break;
  case 'timer/toggle':next.timer.endsAt=next.timer.endsAt>now?now:now+SESSION_TIMER_MS;break;
  case 'timer/plus30':next.timer.endsAt=Math.min(now+SESSION_TIMER_MS,Math.max(now,next.timer.endsAt)+TIMER_PLUS_MS);break;
  case 'item/create':next.items.unshift({...structuredClone(action.input),id:`m${next.counters.nextItemNo++}`,sellerId:actorId,status:'available',reservedFor:null,buyerId:null,soldAt:null,pendingRequest:null,likedBy:[],likeCount:0,views:0,createdAt:at});break;
  case 'item/update':Object.assign(next.items.find(i=>i.id===action.id)!,structuredClone(action.patch));break;
  case 'item/delete':next.items=next.items.filter(i=>i.id!==action.id);break;
  case 'item/view':next.items.find(i=>i.id===action.id)!.views++;break;
  case 'item/like': {const i=next.items.find(i=>i.id===action.id)!;if(i.likedBy.includes(actorId)){i.likedBy=i.likedBy.filter(u=>u!==actorId);i.likeCount--;}else{i.likedBy.push(actorId);i.likeCount++;}break;}
  case 'item/reserve': {const i=next.items.find(i=>i.id===action.id)!;i.status='reserved';i.reservedFor=action.userId;i.finalBuyerId=null;i.pendingRequest=null;break;}
  case 'item/releaseReservation': {const i=next.items.find(i=>i.id===action.id)!;i.status='available';i.reservedFor=null;i.finalBuyerId=null;i.pendingRequest=null;break;}
  case 'item/sellTo': {const i=next.items.find(i=>i.id===action.id)!;i.finalBuyerId=action.userId;i.status='reserved';i.reservedFor=action.userId;i.pendingRequest=null;break;}
  case 'item/confirmReceipt':settle(next.items.find(i=>i.id===action.id)!,actorId);break;
  case 'item/undoReceipt': {
   const i=next.items.find(i=>i.id===action.id)!,receipt=i.receipt!;
   tx('market_purchase_refund',actorId,receipt.price,'item',i.id,`${i.title} · 완료 되돌림`,i.sellerId).reversesTxId=receipt.purchaseTxId;
   tx('market_sale_reversal',i.sellerId,-receipt.price,'item',i.id,`${i.title} · 완료 되돌림`,actorId).reversesTxId=receipt.saleTxId;
   for(const record of next.transactions)if(record.id===receipt.purchaseTxId||record.id===receipt.saleTxId)record.reversedAt=at;
   i.status='reserved';i.reservedFor=actorId;i.finalBuyerId=actorId;i.buyerId=null;i.soldAt=null;i.receipt=null;
   notify(i.sellerId,'purchase_approved',i.id,'구매자가 거래 완료를 되돌렸어요');break;
  }
  case 'teams/send': {const t=next.teams[action.threadKey]!;const msgId=id('msg');t.messages.push({id:msgId,from:'me',senderId:actorId,text:action.text.trim(),at});t.pendingReplyFor=msgId;break;}
  case 'teams/reply': {const t=next.teams[action.threadKey]!;const sender=t.messages.find(m=>m.id===t.pendingReplyFor)?.senderId??actorId;t.messages.push({id:id('msg'),from:'them',senderId:t.participants.find(u=>u!==sender),text:replyForThread(next,t),at});t.pendingReplyFor=null;break;}
  case 'admin/restrict': {
   const order:RestrictionKind[]=['quest_post','purchase'];for(const kind of order.filter(k=>action.kinds.includes(k)&&!activeRestriction(next,action.userId,k,now))){const rId=`r${next.counters.nextRestrictionNo++}`;const days=RESTRICTION_DURATIONS[action.duration];next.restrictions.push({id:rId,userId:action.userId,kind,reason:action.reason.trim(),startsAt:at,endsAt:days===null?null:toISO(now+days*86400000),createdBy:actorId,flagId:action.flagId??null,liftedAt:null,liftedBy:null,liftReason:null});log('restrict',action.userId,rId,action.flagId??null,`${next.users[action.userId]!.name} · ${kind==='quest_post'?'퀘스트 등록 제한':'구매 제한'} · 사유: ${action.reason.trim()}`);}if(action.flagId)flagState(action.flagId,'actioned',action.reason.trim());break;
  }
  case 'admin/lift': {const r=next.restrictions.find(r=>r.id===action.restrictionId)!;r.liftedAt=at;r.liftedBy=actorId;r.liftReason=action.reason.trim();log('lift',r.userId,r.id,r.flagId,`${next.users[r.userId]!.name} · 제재 해제 · 사유: ${action.reason.trim()}`);break;}
  case 'admin/dismissFlag':flagState(action.flagId,'dismissed',action.reason.trim());log('dismiss_flag',null,null,action.flagId,`무혐의 처리 · 사유: ${action.reason.trim()}`);break;
 }
 return next;
}
