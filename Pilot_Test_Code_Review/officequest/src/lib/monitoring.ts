import { MONITOR_RULES as M, MONITOR_WINDOW_DAYS, SEED_STALE_DAYS } from './constants';
import { formatKstDate } from './formulas';
import type { DB, Flag, FlagRule, RatingRecord, Transaction } from './types';
export const FLAG_LABELS:Record<FlagRule,string>={pair_repeat:'동일 요청자→작업자 반복 완료',reciprocal:'상호 승인',pair_5star:'특정 쌍 만점 독점',fast_high_bounty:'고액 현상금 초고속 승인',market_pair:'동일 상대 반복 거래'};
export const isSeedStale = (db:DB,now:number):boolean => now-Date.parse(db.seededAt)>=SEED_STALE_DAYS*86400000;
export function detectFlags(db:DB,now:number):Flag[] {
 const lower=now-MONITOR_WINDOW_DAYS*86400000;
 const inWindow=(at:string)=>Date.parse(at)>=lower&&Date.parse(at)<=now;
 const player=(id:string)=>db.users[id]?.role==='player';
 const ratings=db.ratings.filter(r=>inWindow(r.approvedAt)&&player(r.requesterId)&&player(r.workerId));
 const txs=db.transactions.filter(t=>t.type==='market_purchase'&&!t.reversedAt&&t.amount<0&&inWindow(t.at)&&player(t.userId)&&t.counterpartyId&&player(t.counterpartyId));
 const flags:Flag[]=[];
 const name=(id:string)=>db.users[id]?.name??id;
 const re=(r:RatingRecord):Flag['evidence'][number]=>({kind:'rating',refId:r.id,at:r.approvedAt,text:`${r.questRef} · ${name(r.requesterId)} → ${name(r.workerId)} · 별점 ${r.stars} · 현상금 ${r.bounty.toLocaleString('ko-KR')} P · ${formatKstDate(r.approvedAt)}`});
 const te=(t:Transaction):Flag['evidence'][number]=>({kind:'tx',refId:t.id,at:t.at,text:`Tx ${t.id} · ${name(t.userId)} → ${name(t.counterpartyId!)} · ${Math.abs(t.amount).toLocaleString('ko-KR')} P · ${formatKstDate(t.at)}`});
 const add=(id:string,rule:FlagRule,severity:Flag['severity'],subjects:string[],evidence:Flag['evidence'],alsoMatched:FlagRule[]=[])=>{
  evidence.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)||a.refId.localeCompare(b.refId));
  const lastAt=evidence[evidence.length-1]!.at; const st=db.flagStates[id];
  const newer=st&&Date.parse(lastAt)>Date.parse(st.lastAt);
  flags.push({id,rule,severity,subjects,lastAt,evidence,status:newer?'open':st?.status??'open',alsoMatched,newEvidence:newer?evidence.filter(e=>Date.parse(e.at)>Date.parse(st.lastAt)).length:0});
 };
 const directed=new Map<string,RatingRecord[]>();
 const unordered=new Map<string,RatingRecord[]>();
 for(const r of ratings){const key=`${r.requesterId}__${r.workerId}`;directed.set(key,[...(directed.get(key)??[]),r]);const pair=[r.requesterId,r.workerId].sort().join('__');unordered.set(pair,[...(unordered.get(pair)??[]),r]);
  const duration=Date.parse(r.approvedAt)-Date.parse(r.postedAt);
  if(r.bounty>=M.fastBountyMin&&duration>=0&&duration<=M.fastMinutesMax*60000)add(`fast_high_bounty__${r.questRef}`,'fast_high_bounty','high',[r.requesterId,r.workerId],[re(r)]);
 }
 for(const [key,rs] of directed){if(rs.length>=M.pair5StarMin&&rs.every(r=>r.stars===5))add(`pair_5star__${key}`,'pair_5star','medium',[rs[0]!.requesterId,rs[0]!.workerId],rs.map(re),['pair_repeat']);else if(rs.length>=M.pairRepeatMin)add(`pair_repeat__${key}`,'pair_repeat','medium',[rs[0]!.requesterId,rs[0]!.workerId],rs.map(re));}
 for(const [key,rs] of unordered){const [a,b]=key.split('__');if(a&&b&&(directed.get(`${a}__${b}`)?.length??0)>=M.reciprocalMin&&(directed.get(`${b}__${a}`)?.length??0)>=M.reciprocalMin)add(`reciprocal__${key}`,'reciprocal','high',[a,b],rs.map(re));}
 const pairs=new Map<string,Transaction[]>();for(const t of txs){const key=[t.userId,t.counterpartyId!].sort().join('__');pairs.set(key,[...(pairs.get(key)??[]),t]);}
 for(const [key,ts] of pairs){if(ts.length>=M.marketPairCountMin||(ts.length>=M.marketPairSumCountMin&&ts.reduce((s,t)=>s-t.amount,0)>=M.marketPairSumMin))add(`market_pair__${key}`,'market_pair','medium',key.split('__'),ts.map(te));}
 return flags.sort((a,b)=>(a.severity===b.severity?0:a.severity==='high'?-1:1)||Date.parse(b.lastAt)-Date.parse(a.lastAt)||a.id.localeCompare(b.id));
}
