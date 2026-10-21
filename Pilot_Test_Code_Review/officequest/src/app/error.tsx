'use client';
import Link from 'next/link';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui';
export default function ErrorView({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="shell" data-testid="app-root"><section className="card pad quest-empty" role="alert" data-testid="app-error"><ShieldAlert size={40}/><h1>화면을 불러오지 못했어요</h1><p>다시 시도하거나 대시보드로 돌아가 주세요.</p><div className="row gap12"><Button variant="primary" onClick={reset}><RotateCcw size={17}/>다시 시도</Button><Link prefetch={false} className="btn" href="/">대시보드로</Link></div></section></main>;}
