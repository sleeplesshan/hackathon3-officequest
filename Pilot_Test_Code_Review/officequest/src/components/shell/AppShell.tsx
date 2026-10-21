'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { LayoutDashboard, ScrollText, House, Zap, RotateCcw, ChevronDown, Sun, Moon, Gift, Plus, Pencil, Send, Check, Info, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useDb } from '@/lib/db/DbProvider';
import { dailyCompletedCount, formatTimer, tierForExp } from '@/lib/formulas';
import { formatNumber, formatKstDate } from '@/lib/format';
import { activeRestrictions, RESTRICTION_LABELS } from '@/lib/restrictions';
import type { PersonaId } from '@/lib/types';
import { Avatar, ConfirmModal } from '@/components/ui';
import PixelSprite from '@/components/pixel/PixelSprite';
import { playHoverSound } from '@/lib/audio';
import { canBrowseBoard, QUEST_TIME_NOTICE } from '@/lib/quest-access';
import { SoundToggle } from '@/components/feedback/RewardFeedback';
import { emitCoinBurst } from '@/components/pixel/useCoinBurst';

export function Gnb() {
  const {db,user,personaId,theme,now,dispatch,setPersona,toggleTheme,reset}=useDb();
  const path=usePathname();const [personas,setPersonas]=useState(false);const [debug,setDebug]=useState(false);const [confirm,setConfirm]=useState(false);
  const navRef=useRef<HTMLElement>(null);const [indicator,setIndicator]=useState<{left:number;width:number}|null>(null);
  useLayoutEffect(()=>{const measure=()=>{const link=navRef.current?.querySelector<HTMLElement>('.tab.on');if(link)setIndicator({left:link.offsetLeft,width:link.offsetWidth});else setIndicator(null);};measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);},[path,user?.role]);
  if(!db||!user)return null;
  const remaining=Math.max(0,db.timer.endsAt-now);
  return <>
    <header className={`gnb ${user.role==='admin'?'admin-gnb':''}`} data-testid="gnb">
      <Link prefetch={false} href="/" className="brand" aria-label="OFFICE QUEST 대시보드"><span className="lgt"><PixelSprite name="star" scale={4}/></span><span>OFFICE QUEST</span><small>× 효성마을</small></Link>
      <nav ref={navRef} className={`tabs ${indicator?'has-indicator':''}`} aria-label="주요 메뉴" onPointerEnter={event=>emitCoinBurst(event.currentTarget)}>
        {indicator&&<span className="nav-indicator" style={{width:indicator.width,transform:`translateX(${indicator.left}px)`}}/>}
        <Link prefetch={false} className={`tab ${path==='/'?'on':''}`} onPointerEnter={playHoverSound} data-testid="nav-dashboard" href="/"><LayoutDashboard size={16}/>대시보드</Link>
        <Link prefetch={false} className={`tab ${path.startsWith('/quests')?'on':''}`} onPointerEnter={playHoverSound} data-testid="nav-quests" href={canBrowseBoard(db,personaId,now)?'/quests/board':'/quests/daily'}><ScrollText size={16}/>업무 퀘스트</Link>
        <Link prefetch={false} className={`tab ${path.startsWith('/village')?'on':''}`} onPointerEnter={playHoverSound} data-testid="nav-village" href="/village"><House size={16}/>효성마을</Link>
        {user.role==='admin'&&<Link prefetch={false} className={`tab ${path.startsWith('/admin')?'on':''}`} onPointerEnter={playHoverSound} data-testid="nav-admin" href="/admin"><ShieldCheck size={16}/>운영자 콘솔</Link>}
      </nav>
      <div className="gr">
        <div className={`tmr ${remaining===0?'expired':''}`}><span className="lv"/><div><div className="l">시연 세션 남은 시간</div><b className="num" data-testid="timer-display">{[...formatTimer(remaining)].map((c,i)=><span key={i} className={c===':'?'':'dg'}>{c}</span>)}</b></div><div className="tctl">
          <button className="z" data-testid="timer-ctl-toggle" onClick={()=>dispatch({type:'timer/toggle'})}><Zap size={13}/><span>시연 타이머</span></button>
          <button data-testid="timer-ctl-plus30" onClick={()=>dispatch({type:'timer/plus30'})}>+30분</button>
          <button data-testid="timer-ctl-expire" onClick={()=>dispatch({type:'timer/expire'})}>만료 테스트</button>
          <button data-testid="timer-ctl-reset" onClick={()=>dispatch({type:'timer/reset'})} aria-label="타이머 리셋"><RotateCcw size={13}/></button>
        </div></div>
        {user.role==='admin'?<div className="chip" data-testid="admin-badge"><ShieldCheck size={18}/>운영자</div>:<div className="chip num" data-testid="points-chip"><PixelSprite name="coin" scale={3}/>{formatNumber(user.points)}<small>P</small></div>}
        <div className="persona-anchor"><button className="persona-current" data-testid="persona-switcher" aria-expanded={personas} onClick={()=>{setPersonas(!personas);setDebug(false);}}><Avatar user={user} size={32}/><span>{user.name}<small>{user.dept}</small></span><ChevronDown size={15}/></button>
          {personas&&<><button className="menu-dismiss" aria-label="페르소나 메뉴 닫기" onClick={()=>setPersonas(false)}/><div className="persona-menu" role="menu">{(['kim','lee','park','ops'] as PersonaId[]).map(id=><div key={id}>{id==='ops'&&<p className="menu-label">운영자</p>}<button role="menuitem" data-testid={`persona-option-${id}`} className={personaId===id?'selected':''} onClick={()=>{setPersona(id);setPersonas(false);}}><Avatar user={db.users[id]!}/><span><b>{db.users[id]!.name}</b><small>{db.users[id]!.dept}</small></span>{personaId===id&&<Check size={16}/>}</button></div>)}</div></>}
        </div>
        <button className="thm" data-testid="theme-toggle" onClick={toggleTheme} aria-label={theme==='light'?'게이밍 모드 켜기':'라이트 모드 켜기'}><span>{theme==='dark'?'게이밍':'라이트'}</span><span className="sw"><i className="k">{theme==='dark'?<Moon size={14}/>:<Sun size={14}/>}</i></span></button>
        <SoundToggle/><div className="debug-anchor"><button className="debug-trigger" data-testid="debug-menu" onClick={()=>{setDebug(!debug);setPersonas(false);}} aria-label="DEBUG 메뉴"><Zap size={14}/></button>{debug&&<div className="debug-panel"><b>시연 데이터</b><button data-testid="debug-reset-data" onClick={()=>{setDebug(false);setConfirm(true);}}><RotateCcw size={14}/>데이터 초기화</button></div>}</div>
      </div>
    </header>
    {confirm&&<ConfirmModal title="시연 데이터를 초기화할까요?" onClose={()=>setConfirm(false)} onConfirm={()=>{reset();setConfirm(false);}}><p>등록한 퀘스트와 거래 기록을 지우고 처음 시드 데이터로 돌아가요.</p></ConfirmModal>}
  </>;
}

export function QuestSidebar() {
  const {db,user,personaId,now,toast}=useDb();const path=usePathname();if(!db||!user)return null;
  const main=[{id:'daily',href:'/quests/daily',title:'일일 퀘스트',Icon:Gift,count:`${dailyCompletedCount(db,personaId)}/4`},{id:'new',href:'/quests/new',title:'퀘스트 등록',Icon:Plus,count:''},{id:'board',href:'/quests/board',title:'업무 퀘스트 게시판',Icon:ScrollText,count:db.quests.length}];
  return <aside className="card side" aria-label="업무 퀘스트 사이드바"><h4>업무 퀘스트</h4>{main.map(x=>x.id==='board'&&!canBrowseBoard(db,personaId,now)?<button type="button" key={x.id} data-testid="side-quest-board" aria-disabled="true" className="nv quest-nav-locked" onClick={()=>toast(QUEST_TIME_NOTICE,'info')}><span className="t"><x.Icon size={17}/></span>{x.title}<em>잠김</em></button>:<Link prefetch={false} key={x.id} href={x.href} onPointerEnter={x.id==='new'?playHoverSound:undefined} data-testid={`side-quest-${x.id}`} className={`nv ${path===x.href||(x.id==='board'&&/\/quests\/\d/.test(path))?'on':''}`}><span className="t"><x.Icon size={17}/></span>{x.title}<em>{x.count}</em></Link>)}<h4>내 퀘스트</h4>{[{id:'requested',Icon:Pencil,title:'내가 요청한 퀘스트',count:db.quests.filter(q=>q.requesterId===personaId).length},{id:'applied',Icon:Send,title:'내가 참여한 퀘스트',count:db.quests.filter(q=>q.workerId===personaId||q.applications.some(a=>a.userId===personaId)||(q.answers??[]).some(a=>a.authorId===personaId)).length},{id:'done',Icon:Check,title:'완료 내역',count:user.completedTotal}].map(x=><Link prefetch={false} key={x.id} href={`/quests/board?mine=${x.id}`} data-testid={`side-mine-${x.id}`} className="nv"><span className="t"><x.Icon size={17}/></span>{x.title}<em>{x.count}</em></Link>)}<div className="sidebox" data-testid="side-today-limit"><b><Info size={14}/> 오늘 완료 보상 {user.completedToday} / 2</b><p>퀘스트 완료 보상은 작업자 기준 하루 2회까지 지급돼요. 별점에 따라 50–150 EXP를 받아요.</p></div></aside>;
}

export function RestrictionBanner() {
  const {db,user,now}=useDb();if(!db||!user||user.role==='admin')return null;
  const restrictions=activeRestrictions(db,user.id,now);if(!restrictions.length)return null;
  return <div className="restriction-banner" data-testid="restriction-banner" data-kinds={restrictions.map(r=>r.kind).join(',')} role="status"><ShieldAlert size={20}/><div><b>운영자 제재 중 · {restrictions.map(r=>RESTRICTION_LABELS[r.kind]).join(' · ')}</b>{restrictions.map(r=><p key={r.id}>{RESTRICTION_LABELS[r.kind]} · 기간: {formatKstDate(r.startsAt)} ~ {r.endsAt?formatKstDate(r.endsAt):'해제 시까지'} · 사유: {r.reason}</p>)}</div></div>;
}

export function AppShell({children,sidebar=false,className=''}:{children:ReactNode;sidebar?:boolean|ReactNode;className?:string}) {
  const {db,user}=useDb();
  if(!db||!user)return <main data-testid="app-root" className="shell dashboard-shell"><div data-testid="skeleton" className="skeleton-shell"><div/><div/><div/><div/></div></main>;
  return <><div className="bgfx"/><div className="blob blob-left"/><div className="blob blob-right"/><Gnb/><main data-testid="app-root" className={`shell ${sidebar?'ws':''} ${className}`}>{sidebar&&(sidebar===true?<QuestSidebar/>:sidebar)}<div className="page-content"><RestrictionBanner/>{children}</div></main></>;
}

export function TierEquipment({tier}:{tier:ReturnType<typeof tierForExp>}) {return <>{({bronze:'기본 사원복 장착',silver:'은빛 망토 장착',gold:'황금 갑옷 장착',platinum:'사이버 고글 장착',diamond:'크리스탈 날개 장착',master:'전설의 검 장착'})[tier]}</>;}
