'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Link2, ListFilter, Plus, Search, X } from 'lucide-react';
import { useDb } from '@/lib/db/useDb';
import { selectQuests, questFilterCounts, type QuestFilters } from '@/lib/db/selectors';
import { canPostQuest } from '@/lib/guards';
import { formatKstDate } from '@/lib/formulas';
import { formatNumber } from '@/lib/format';
import { TZ } from '@/lib/constants';
import { Button, StatusBadge, TypeBadge, UserLine } from '@/components/ui';
import type { QuestStatus, QuestType } from '@/lib/types';
import '@/styles/quest-board.css';
import { canBrowseBoard } from '@/lib/quest-access';
import QuestTimeNotice from './QuestTimeNotice';
const TYPES:{key:'all'|QuestType;label:string}[]=[{key:'all',label:'전체'},{key:'inquiry',label:'문의'},{key:'request',label:'요청'}];
const STATUSES:{key:'all'|QuestStatus;label:string}[]=[{key:'all',label:'전체'},{key:'recruiting',label:'모집중'},{key:'in_progress',label:'진행중'},{key:'revision',label:'보완요청'},{key:'done',label:'완료'}];
const MINE_LABELS={requested:'내가 요청한 퀘스트',applied:'내가 참여한 퀘스트',done:'완료 내역'};
function deadline(at:string):string {const parts=new Intl.DateTimeFormat('ko-KR',{timeZone:TZ,month:'2-digit',day:'2-digit',weekday:'short'}).formatToParts(new Date(at));const get=(key:string)=>parts.find(p=>p.type===key)?.value??'';return `${get('month')}/${get('day')}(${get('weekday')})`;}
export function QuestBoard(){
 const {db,user,personaId,now}=useDb();const params=useSearchParams();const router=useRouter();const [query,setQuery]=useState(params.get('q')??'');
 const urlQuery=params.get('q')??'';useEffect(()=>setQuery(urlQuery),[urlQuery]);
 const type=TYPES.some(t=>t.key===params.get('type'))?params.get('type') as 'all'|QuestType:'all';
 const status=STATUSES.some(s=>s.key===params.get('status'))?params.get('status') as 'all'|QuestStatus:'all';
 const mine=['requested','applied','done'].includes(params.get('mine')??'')?params.get('mine') as QuestFilters['mine']:undefined;
 const sort=['reward','views'].includes(params.get('sort')??'')?params.get('sort') as 'reward'|'views':'newest';
 const filters:QuestFilters={type,status,q:urlQuery,mine,sort};
 function update(patch:Record<string,string|undefined>,replace=false){const next=new URLSearchParams(window.location.search);for(const [key,value] of Object.entries(patch)){if(value===undefined||value===''||value==='all'||(key==='sort'&&value==='newest')||(key==='page'&&value==='1'))next.delete(key);else next.set(key,value);}if(!('page' in patch))next.delete('page');const href=`/quests/board${next.size?`?${next.toString()}`:''}`;if(replace)window.history.replaceState(null,'',href);else window.history.pushState(null,'',href);}
 if(!db||!user)return null;
 if(!canBrowseBoard(db,personaId,now,mine))return <QuestTimeNotice/>;
 const all=selectQuests(db,filters,personaId);const counts=questFilterCounts(db,filters,personaId);const permission=canPostQuest(db,personaId,now);const pageCount=Math.max(1,Math.ceil(all.length/10));const rawPage=Number(params.get('page')??1);const page=Math.max(1,Math.min(pageCount,Number.isFinite(rawPage)?Math.floor(rawPage):1));const rows=all.slice((page-1)*10,page*10);
 const reset=()=>{setQuery('');window.history.pushState(null,'','/quests/board');};
 return <section className="card quest-board" aria-labelledby="quest-board-title">
  <header className="ph quest-board-heading"><div><nav className="crumb" aria-label="현재 위치"><span>업무 퀘스트</span><ChevronRight size={13}/><span>게시판</span></nav><h1 id="quest-board-title">{mine?MINE_LABELS[mine]:'업무 퀘스트 게시판'}</h1><p>사내 동료의 문의에 답하고, 요청 업무를 해결해 포인트와 EXP를 모으세요.</p></div><Button hoverSound variant="primary" size="lg" data-testid="board-new-btn" disabled={!permission.ok} reason={permission.ok?undefined:permission.reason} onClick={()=>router.push('/quests/new')}><Plus size={19}/>퀘스트 등록하기</Button></header>
  <div className="quest-board-filters">
   <div className="quest-filter-group" role="group" aria-label="퀘스트 분류"><span className="quest-filter-label">분류</span>{TYPES.map(t=><button key={t.key} type="button" className={`fchip ${type===t.key?'on':''}`} aria-pressed={type===t.key} data-testid={`board-filter-type-${t.key}`} onClick={()=>update({type:t.key})}>{t.label}<em>{counts.types[t.key]}</em></button>)}</div>
   <span className="quest-filter-divider"/>
   <div className="quest-filter-group" role="group" aria-label="퀘스트 상태"><span className="quest-filter-label">상태</span>{STATUSES.map(s=><button key={s.key} type="button" className={`fchip ${status===s.key?'on':''}`} aria-pressed={status===s.key} data-testid={`board-filter-status-${s.key}`} onClick={()=>update({status:s.key})}>{s.label}{s.key!=='all'&&<em>{counts.statuses[s.key]}</em>}</button>)}</div>
   <div className="quest-board-search-controls"><label className="srch quest-board-search"><Search size={16} aria-hidden="true"/><input data-testid="board-search" aria-label="제목, 요청자, 부서 검색" placeholder="제목, 요청자, 부서 검색" value={query} onChange={event=>{setQuery(event.target.value);update({q:event.target.value},true);}}/>{query&&<button type="button" aria-label="검색어 지우기" onClick={()=>{setQuery('');update({q:undefined},true);}}><X size={14}/></button>}</label><label className="quest-sort"><span className="sr-only">퀘스트 정렬</span><select data-testid="board-sort" value={sort} onChange={event=>update({sort:event.target.value})}><option value="newest">최신순</option><option value="reward">보상순</option><option value="views">조회순</option></select></label></div>
  </div>
  {mine&&<div className="quest-mine-filter"><ListFilter size={14}/><span>{MINE_LABELS[mine]}</span><button type="button" aria-label="내 퀘스트 필터 해제" onClick={()=>update({mine:undefined})}><X size={14}/></button></div>}
  <div className="quest-board-table-wrap"><table className="tbl quest-board-table"><caption className="sr-only">업무 퀘스트 {all.length}건 · {page}페이지</caption><colgroup><col className="quest-col-no"/><col className="quest-col-type"/><col className="quest-col-status"/><col className="quest-col-title"/><col className="quest-col-reward"/><col className="quest-col-user"/><col className="quest-col-applicants"/><col className="quest-col-views"/><col className="quest-col-date"/></colgroup><thead><tr>{['No','분류','상태','제목','보상','요청자','지원 / 답변','조회','등록일'].map(label=><th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(q=><tr key={q.no} data-testid={`board-row-${q.no}`} onClick={event=>{if(!(event.target as HTMLElement).closest('a'))router.push(`/quests/${q.no}`);}}><td className="mut num">{q.no}</td><td><TypeBadge type={q.type}/></td><td><StatusBadge status={q.status} testId={`board-row-status-${q.no}`}/></td><td><Link prefetch={false} href={`/quests/${q.no}`} className="tt quest-title-link">{q.title}</Link><div className="tm"><span><CalendarDays size={12}/>{q.status==='done'?'마감 완료':`마감 ${deadline(q.dueAt)}`}</span>{q.type==='request'&&q.attachments.some(a=>a.kind==='sharepoint')&&<span className="quest-sharepoint-meta">· <Link2 size={12}/>SharePoint 첨부</span>}</div></td><td className="rw2"><b className="num">100P + {formatNumber(q.bounty)}P</b><span>현상금 에스크로</span></td><td><UserLine user={db.users[q.requesterId]!}/></td><td className="num" data-testid={`board-row-applicants-${q.no}`}><b>{q.type==='inquiry'?(q.answers?.length??0):q.applications.length}</b>{q.type==='inquiry'?'개':'명'}</td><td className="num mut" data-testid={`board-row-views-${q.no}`}>{formatNumber(q.views)}</td><td className="num mut">{formatKstDate(q.createdAt).slice(0,5)}</td></tr>)}</tbody></table></div>
  {!rows.length&&<div className="quest-board-empty" role="status"><Search size={30}/><h2>조건에 맞는 퀘스트가 없어요</h2><p>다른 검색어를 입력하거나 필터를 초기화해 보세요.</p><Button onClick={reset}>필터 초기화</Button></div>}
  <footer className="quest-board-footer"><p>총 {all.length}건 · 기본 보상 100P는 시스템 지급, 현상금은 요청자 포인트에서 등록 시 선차감</p><nav className="quest-board-pagination" data-testid="board-pagination" aria-label="게시판 페이지"><button type="button" className="btn sm" aria-label="이전 페이지" disabled={page===1} onClick={()=>update({page:String(page-1)})}><ChevronLeft size={15}/></button>{Array.from({length:pageCount},(_,i)=>i+1).filter(n=>Math.abs(n-page)<=2||n===1||n===pageCount).map((n,i,ns)=><span key={n}>{i>0&&n-ns[i-1]!>1&&<span className="quest-page-gap">…</span>}<button type="button" className={`btn sm ${n===page?'pri':''}`} aria-current={n===page?'page':undefined} aria-label={`${n}페이지`} onClick={()=>update({page:String(n)})}>{n}</button></span>)}<button type="button" className="btn sm" aria-label="다음 페이지" disabled={page===pageCount} onClick={()=>update({page:String(page+1)})}><ChevronRight size={15}/></button></nav></footer>
 </section>;
}
export default QuestBoard;
