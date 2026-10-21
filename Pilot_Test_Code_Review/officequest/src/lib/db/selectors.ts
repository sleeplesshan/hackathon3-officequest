import type { DB, ItemCategory, MarketItem, Quest, QuestStatus, QuestType, User, UserId, VillageKey } from '../types';
import { ITEM_CATEGORIES, VILLAGE_LABELS } from './seed';
import { SITE_LABELS } from '../teams-replies';
export { ranking, topFive, dailyCompletedCount } from '../formulas';
export { activeRestrictions } from '../restrictions';
export { detectFlags } from '../monitoring';
export interface QuestFilters {type?:QuestType|'all';status?:QuestStatus|'all';q?:string;mine?:'requested'|'applied'|'done';sort?:'newest'|'reward'|'views';}
export interface ItemFilters {v?:VillageKey|'all';cat?:ItemCategory|'all';q?:string;onlyAvailable?:boolean;onlyFree?:boolean;sort?:'newest'|'popular'|'price';}
export const selectUser=(db:DB,id:UserId):User|undefined=>db.users[id];
export const selectQuest=(db:DB,no:number):Quest|undefined=>db.quests.find(q=>q.no===no);
export const selectItem=(db:DB,id:string):MarketItem|undefined=>db.items.find(i=>i.id===id);
const includes=(text:string,search='')=>text.toLocaleLowerCase('ko-KR').includes(search.trim().toLocaleLowerCase('ko-KR'));
export function selectQuests(db:DB,filters:QuestFilters={},actor:UserId='kim'):Quest[] {
 return db.quests.filter(q=>{
  const u=db.users[q.requesterId];
  return (!filters.type||filters.type==='all'||q.type===filters.type)&&(!filters.status||filters.status==='all'||(filters.status==='in_progress'?['in_progress','revision'].includes(q.status):q.status===filters.status))&&(!filters.q||includes(`${q.title} ${u?.name??''} ${u?.dept??''}`,filters.q))&&(!filters.mine||(filters.mine==='requested'?q.requesterId===actor:filters.mine==='applied'?(q.workerId===actor||q.applications.some(a=>a.userId===actor)||(q.answers??[]).some(a=>a.authorId===actor)):q.status==='done'&&(q.workerId===actor||q.requesterId===actor)));
 }).sort((a,b)=>filters.sort==='reward'?b.bounty-a.bounty||b.no-a.no:filters.sort==='views'?b.views-a.views||b.no-a.no:b.no-a.no);
}
export function questFilterCounts(db:DB,filters:QuestFilters={},actor:UserId='kim'):{types:Record<'all'|QuestType,number>;statuses:Record<'all'|QuestStatus,number>} {
 const countType=(type:'all'|QuestType)=>selectQuests(db,{...filters,type},actor).length;
 const countStatus=(status:'all'|QuestStatus)=>selectQuests(db,{...filters,status},actor).length;
 return {types:{all:countType('all'),inquiry:countType('inquiry'),request:countType('request')},statuses:{all:countStatus('all'),recruiting:countStatus('recruiting'),in_progress:countStatus('in_progress'),revision:countStatus('revision'),done:countStatus('done')}};
}
export function selectItems(db:DB,filters:ItemFilters={}):MarketItem[] {
 return db.items.filter(i=>{const u=db.users[i.sellerId];return (!filters.v||filters.v==='all'||i.village===filters.v)&&(!filters.cat||filters.cat==='all'||i.category===filters.cat)&&(!filters.onlyAvailable||i.status==='available')&&(!filters.onlyFree||i.mode==='free')&&(!filters.q||includes(`${i.title} ${VILLAGE_LABELS[i.village]} ${u?.name??''}`,filters.q));}).sort((a,b)=>filters.sort==='popular'?b.likeCount-a.likeCount||Date.parse(b.createdAt)-Date.parse(a.createdAt):filters.sort==='price'?a.price-b.price||Date.parse(b.createdAt)-Date.parse(a.createdAt):Date.parse(b.createdAt)-Date.parse(a.createdAt)||b.id.localeCompare(a.id));
}
export function itemFilterCounts(db:DB,filters:ItemFilters={}):{villages:Record<'all'|VillageKey,number>;categories:Record<'all'|ItemCategory,number>} {
 const villages=Object.fromEntries(['all',...Object.keys(VILLAGE_LABELS)].map(v=>[v,selectItems(db,{...filters,v:v as 'all'|VillageKey}).length])) as Record<'all'|VillageKey,number>;
 const categories=Object.fromEntries(['all',...Object.keys(ITEM_CATEGORIES)].map(cat=>[cat,selectItems(db,{...filters,cat:cat as 'all'|ItemCategory}).length])) as Record<'all'|ItemCategory,number>;
 return {villages,categories};
}
export function selectOrgEmployees(db:DB,sellerId:UserId,search='',minimumPoints?:number):User[] {return Object.values(db.users).filter(u=>u.role==='player'&&u.id!==sellerId&&includes(`${u.name} ${u.employeeNo} ${u.dept} ${SITE_LABELS[u.site]}`,search)&&(minimumPoints===undefined||u.points>=minimumPoints));}
export const popularItems=(db:DB):MarketItem[]=>db.items.filter(i=>i.status!=='sold').sort((a,b)=>b.likeCount-a.likeCount||a.id.localeCompare(b.id)).slice(0,3);
export const latestQuests=(db:DB):Quest[]=>selectQuests(db).slice(0,3);
export const tradeHistory=(db:DB,id:UserId)=>db.transactions.filter(t=>t.userId===id&&(t.type==='market_purchase'||t.type==='market_sale'||t.type==='market_purchase_refund'||t.type==='market_sale_reversal')).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));
