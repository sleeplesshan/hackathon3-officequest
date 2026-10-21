'use client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type ReactNode } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import PixelSprite from '@/components/pixel/PixelSprite';
import { Button } from '@/components/ui';
import { useDb } from '@/lib/db/useDb';
import { itemFilterCounts } from '@/lib/db/selectors';
import { VILLAGE_LABELS } from '@/lib/db/seed';
import { formatNumber } from '@/lib/format';
import { canAction } from '@/lib/guards';
import { VILLAGES, readMarketFilters, villageHref } from './market-filters';
import TradeHistoryDrawer from './TradeHistoryDrawer';
import '@/styles/village.css';
export function VillageSidebar(){const {db,user,personaId,now}=useDb();const params=useSearchParams(),path=usePathname(),router=useRouter();const [drawer,setDrawer]=useState(false);if(!db||!user)return null;const filters=readMarketFilters(params);const counts=itemFilterCounts(db,filters).villages;const selling=db.items.filter(i=>i.sellerId===personaId);const requests=db.items.filter(i=>i.finalBuyerId===personaId&&i.status!=='sold').length;const permission=canAction(db,{type:'item/create',input:{title:'중고물품',village:user.village,category:'digital',mode:'free',price:0,bodyHtml:'',photos:[]}},personaId,now);return <><aside className="card side village-sidebar" aria-label="효성마을 사이드바"><Link prefetch={false} href="/village" className="village-sidebar-title"><PixelSprite name="house" scale={3}/><b>효성마을</b></Link><p className="village-sidebar-subtitle">사내 포인트 중고거래 마켓</p><Button hoverSound variant="primary" data-testid="village-new-btn" disabled={!permission.ok} reason={permission.ok?undefined:permission.reason} onClick={()=>router.push('/village/new')}><Plus size={18}/>중고물품 글 등록</Button><h4>사업장별 마을</h4><nav className="village-nav" aria-label="사업장별 마을"><Link prefetch={false} href={villageHref(new URLSearchParams(params.toString()),{v:undefined})} className={`nv ${path==='/village'&&filters.v==='all'?'on':''}`} data-testid="village-tab-all" data-count={counts.all}><span className="t village-all-label">ALL</span>전체 마을 모아보기<em>{counts.all}</em></Link>{VILLAGES.map(v=><Link prefetch={false} key={v} href={villageHref(new URLSearchParams(params.toString()),{v})} className={`nv ${filters.v===v?'on':''}`} data-testid={`village-tab-${v}`} data-count={counts[v]}><span className="t">{VILLAGE_LABELS[v].slice(0,1)}</span>{VILLAGE_LABELS[v]}<em>{counts[v]}</em></Link>)}</nav><button type="button" className="sidebox village-my-trades" data-testid="my-trades-btn" onClick={()=>setDrawer(true)}><b><ShoppingBag size={15}/>내 거래 현황</b><p>판매중 {selling.filter(i=>i.status==='available').length} · 예약중 {selling.filter(i=>i.status==='reserved').length} · 거래완료 {selling.filter(i=>i.status==='sold').length}<br/>수령 확인 대기 {requests}건 · 보유 {formatNumber(user.points)} P</p></button></aside>{drawer&&<TradeHistoryDrawer onClose={()=>setDrawer(false)}/>}</>;}
export function VillageShell({children}:{children:ReactNode}){const path=usePathname();return <AppShell sidebar={<Suspense fallback={<aside className="card side village-sidebar" aria-busy="true"/>}><VillageSidebar/></Suspense>} className={`village-shell ${path==='/village'?'village-browse-shell':''}`}><Suspense fallback={<div className="card village-loading" aria-busy="true"/>}>{children}</Suspense></AppShell>;}
export default VillageShell;
