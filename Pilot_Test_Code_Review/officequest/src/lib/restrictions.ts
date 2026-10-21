import type { DB, Restriction, RestrictionKind } from './types';
import { formatKstDate } from './formulas';
export function restrictionStatus(r:Restriction,now:number):'lifted'|'expired'|'active' {return r.liftedAt!==null?'lifted':r.endsAt!==null&&now>=Date.parse(r.endsAt)?'expired':'active';}
export const activeRestrictions = (db:DB,userId:string,now:number):Restriction[] => db.restrictions.filter(r=>r.userId===userId&&restrictionStatus(r,now)==='active');
export const activeRestriction = (db:DB,userId:string,kind:RestrictionKind,now:number):Restriction|undefined => activeRestrictions(db,userId,now).find(r=>r.kind===kind);
export const RESTRICTION_LABELS: Record<RestrictionKind,string> = {quest_post:'퀘스트 등록 제한',purchase:'구매 제한'};
export function restrictionReason(r:Restriction):string {return `운영자 제재로 ${r.kind==='quest_post'?'퀘스트 등록이':'구매가'} 제한됐어요 (${r.endsAt?formatKstDate(r.endsAt)+'까지':'해제 시까지'} · 사유: ${r.reason})`;}
