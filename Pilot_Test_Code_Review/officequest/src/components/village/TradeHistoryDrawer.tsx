'use client';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { useDb } from '@/lib/db/useDb';
import { tradeHistory } from '@/lib/db/selectors';
import { formatKstDate } from '@/lib/formulas';
import { formatNumber } from '@/lib/format';
import { Button, Modal } from '@/components/ui';
import '@/styles/village.css';
export function TradeHistoryDrawer({onClose}:{onClose:()=>void}){const {db,user}=useDb();if(!db||!user)return null;const rows=tradeHistory(db,user.id);return <Modal title="내 거래 내역" testId="trade-history-drawer" className="village-trade-drawer" onClose={onClose} footer={<Button onClick={onClose}>닫기</Button>}><div className="village-trade-summary"><span>{user.name} · 보유 포인트</span><strong>{formatNumber(user.points)} P</strong></div><p className="village-trade-description">구매와 판매가 완료되면 양쪽 거래 내역에 기록돼요.</p><div className="village-trade-rows">{rows.map(row=>{const item=db.items.find(i=>i.id===row.refId);const sale=row.type==='market_sale'||row.type==='market_sale_reversal',reversal=!!row.reversesTxId;return <article key={row.id} data-testid="trade-row" data-type={row.type} className="village-trade-row"><span className={`village-trade-icon ${sale?'sale':'purchase'}`}>{sale?<ArrowUpRight size={20}/>:<ArrowDownLeft size={20}/>}</span><div><span>{reversal?'거래 완료 되돌림':row.reversedAt?'완료 취소됨':sale?'판매 완료':'구매 완료'} · {formatKstDate(row.at)}</span>{item?<Link prefetch={false} href={`/village/${item.id}`} onClick={onClose}>{item.title}</Link>:<b>{row.memo}</b>}<small>거래 후 {formatNumber(row.balanceAfter)} P</small></div><strong className={sale?'sale':''}>{row.amount>0?'+':''}{formatNumber(row.amount)} P</strong></article>;})}{!rows.length&&<div className="village-trade-empty"><ShoppingBag size={38}/><h3>아직 완료된 거래가 없어요</h3><p>마을에서 필요한 물건을 찾아보세요.</p><Link prefetch={false} href="/village" className="btn" onClick={onClose}>마을 둘러보기</Link></div>}</div></Modal>;}
export default TradeHistoryDrawer;
