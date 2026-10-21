'use client';
import { ShoppingBag, RotateCcw } from 'lucide-react';
import { useDb } from '@/lib/db/DbProvider';
import { canAction, getBuyState } from '@/lib/guards';
import type { MarketItem } from '@/lib/types';
import { Button } from '@/components/ui';
export default function BuyButton({item}:{item:MarketItem}) {
 const {db,user,now,dispatch,toast}=useDb();if(!db||!user)return null;
 const state=getBuyState(db,item.id,user.id,now);
 if(['seller','hidden','sold'].includes(state))return null;
 const received=state==='received',action={type:received?'item/undoReceipt':'item/confirmReceipt',id:item.id} as const;
 const permission=canAction(db,action,user.id,now);
 return <Button data-testid="buy-btn" data-state={state} aria-pressed={received} variant={received?'secondary':'primary'} size="lg" className="buy-button" disabled={!permission.ok} reason={permission.ok?undefined:permission.reason} onClick={()=>{if(dispatch(action))toast(received?'거래 완료를 되돌리고 포인트를 복원했어요':'물품 수령을 확인하고 거래를 완료했어요');}}>{received?<RotateCcw size={18}/>:<ShoppingBag size={18}/>}샀어요{received?' · 다시 눌러 완료 취소':''}</Button>;
}
