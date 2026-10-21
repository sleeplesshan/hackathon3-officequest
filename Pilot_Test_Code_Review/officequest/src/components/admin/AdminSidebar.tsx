'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ClipboardList, Flag, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useDb } from '@/lib/db/useDb';
import { detectFlags } from '@/lib/monitoring';
import { restrictionStatus } from '@/lib/restrictions';
export function AdminSidebar(){const {db,now}=useDb();const params=useSearchParams();if(!db)return null;const tab=['restrictions','log'].includes(params.get('tab')??'')?params.get('tab'):'flags';const entries=[{key:'flags',title:'의심 활동',Icon:Flag,count:detectFlags(db,now).length},{key:'restrictions',title:'제재 현황',Icon:ShieldAlert,count:db.restrictions.filter(r=>restrictionStatus(r,now)==='active').length},{key:'log',title:'감사 로그',Icon:ClipboardList,count:db.adminLog.length}];return <aside className="card side admin-sidebar" aria-label="운영자 콘솔 사이드바"><div className="admin-sidebar-title"><ShieldCheck size={26}/><b>운영자 콘솔</b></div><p>안전한 협업과 거래를 위해</p><nav aria-label="운영 메뉴">{entries.map(e=><Link prefetch={false} key={e.key} href={`/admin?tab=${e.key}`} className={`nv ${tab===e.key?'on':''}`} aria-current={tab===e.key?'page':undefined}><span className="t"><e.Icon size={17}/></span>{e.title}<em>{e.count}{e.key==='restrictions'&&<small> 활성</small>}</em></Link>)}</nav><div className="sidebox admin-sidebar-note"><b><ShieldCheck size={15}/>운영 기록</b><p>조치와 해제 사유는 감사 로그에 기록돼요. 제재 기간이 지나면 자동으로 만료돼요.</p></div></aside>;}
export default AdminSidebar;
