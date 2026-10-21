import { describe, expect, it } from 'vitest';
import { getBuyState } from '@/lib/guards';
import { detectFlags } from '@/lib/monitoring';
import { NOW, fails, item, itemInput, seed, step } from './domain-fixtures';
import type { Action, DB } from '@/lib/types';
function designate(db=seed(),id='m4',buyer='kim'):DB{return step(db,{type:'item/sellTo',id,userId:buyer},item(db,id).sellerId);}
describe('seller designation and reversible receipt',()=>{
 it('designation changes no balances or ledger and reserves for the final buyer',()=>{
  const before=seed(),after=designate(before);expect(item(after,'m4')).toMatchObject({status:'reserved',reservedFor:'kim',finalBuyerId:'kim',buyerId:null,pendingRequest:null});expect(after.users).toEqual(before.users);expect(after.transactions).toEqual(before.transactions);expect(before.items.find(i=>i.id==='m4')!.status).toBe('available');
 });
 it('only the designated buyer can confirm; reservation alone grants no receipt permission',()=>{
  fails(seed(),{type:'item/confirmReceipt',id:'m4'},'kim','NOT_RESERVED_BUYER');fails(seed(),{type:'item/confirmReceipt',id:'m3'},'kim','NOT_RESERVED_BUYER');fails(designate(),{type:'item/confirmReceipt',id:'m4'},'park','NOT_RESERVED_BUYER');fails(designate(),{type:'item/confirmReceipt',id:'m4'},'lee','FORBIDDEN');
 });
 it.each(['m4','m3'])('confirmation %s settles both parties exactly once',id=>{
  const before=designate(seed(),id),price=item(before,id).price,seller=item(before,id).sellerId,after=step(before,{type:'item/confirmReceipt',id});expect(item(after,id)).toMatchObject({status:'sold',buyerId:'kim',reservedFor:null,finalBuyerId:'kim'});expect(after.users.kim!.points).toBe(before.users.kim!.points-price);expect(after.users[seller]!.points).toBe(before.users[seller]!.points+price);expect(after.transactions.slice(-2).map(t=>t.amount)).toEqual([-price,price]);fails(after,{type:'item/confirmReceipt',id},'kim','INVALID_STATE');expect(Date.parse(item(after,id).soldAt!)).toBe(NOW);
 });
 it('second click reverses balances atomically, preserves ledger with compensating records and keeps designation',()=>{
  const before=designate(),sold=step(before,{type:'item/confirmReceipt',id:'m4'}),restored=step(sold,{type:'item/undoReceipt',id:'m4'});expect(restored.users).toEqual(before.users);expect(item(restored,'m4')).toMatchObject({status:'reserved',finalBuyerId:'kim',reservedFor:'kim',buyerId:null,soldAt:null,receipt:null});expect(restored.transactions.slice(-4).map(t=>t.amount)).toEqual([-1200,1200,1200,-1200]);expect(restored.transactions.slice(-4,-2).every(t=>!!t.reversedAt)).toBe(true);expect(restored.transactions.slice(-2).every(t=>!!t.reversesTxId)).toBe(true);fails(restored,{type:'item/undoReceipt',id:'m4'},'kim','FORBIDDEN');const again=step(restored,{type:'item/confirmReceipt',id:'m4'});expect(again.users).toEqual(sold.users);expect(again.transactions).toHaveLength(before.transactions.length+6);
 });
 it('another user or seller cannot undo, legacy sold seeds cannot fabricate refunds',()=>{
  const sold=step(designate(),{type:'item/confirmReceipt',id:'m4'});for(const actor of ['lee','park','ops'])fails(sold,{type:'item/undoReceipt',id:'m4'},actor,'FORBIDDEN');fails(seed(),{type:'item/undoReceipt',id:'m8'},'kang','FORBIDDEN');
 });
 it('undo rejects immutably if the seller has spent settlement funds',()=>{
  const sold=step(designate(),{type:'item/confirmReceipt',id:'m4'});sold.users.lee!.points=0;fails(sold,{type:'item/undoReceipt',id:'m4'},'kim','INSUFFICIENT_POINTS');
 });
 it('buyer balance is private until their own confirmation and rechecked then',()=>{
  const designated=designate(seed(),'m1','lee');expect(item(designated).finalBuyerId).toBe('lee');fails(designated,{type:'item/confirmReceipt',id:'m1'},'lee','INSUFFICIENT_POINTS');
 });
 it('free receipt and undo write zero-valued balanced entries',()=>{
  const before=designate(seed(),'m2','lee'),sold=step(before,{type:'item/confirmReceipt',id:'m2'},'lee'),restored=step(sold,{type:'item/undoReceipt',id:'m2'},'lee');expect(restored.users).toEqual(before.users);expect(restored.transactions.slice(-4).map(t=>t.amount)).toEqual([0,0,0,0]);
 });
 it('reserve is separate from designation; replacing/releasing clears final buyer',()=>{
  let db=designate(seed(),'m1','park');db=step(db,{type:'item/reserve',id:'m1',userId:'jung'});expect(item(db)).toMatchObject({reservedFor:'jung',finalBuyerId:null});db=step(db,{type:'item/releaseReservation',id:'m1'});expect(item(db)).toMatchObject({status:'available',reservedFor:null,finalBuyerId:null});
 });
 it('only seller can designate another player',()=>{
  fails(seed(),{type:'item/sellTo',id:'m1',userId:'park'},'lee','FORBIDDEN');for(const userId of ['kim','ops','unknown'])fails(seed(),{type:'item/sellTo',id:'m1',userId},'kim','VALIDATION');
 });
 it('legacy request/approval endpoints cannot bypass receipt flow',()=>{
  for(const type of ['item/request','item/approveRequest','item/declineRequest'] as const)fails(seed(),{type,id:'m4'},'kim','INVALID_STATE');
 });
 it('CTA is absent except for final buyer, with toggled received state and restriction',()=>{
  expect(getBuyState(seed(),'m4','kim',NOW)).toBe('hidden');expect(getBuyState(seed(),'m3','kim',NOW)).toBe('hidden');expect(getBuyState(seed(),'m1','kim',NOW)).toBe('seller');let db=designate();expect(getBuyState(db,'m4','kim',NOW)).toBe('buy');expect(getBuyState(db,'m4','park',NOW)).toBe('hidden');db=step(db,{type:'item/confirmReceipt',id:'m4'});expect(getBuyState(db,'m4','kim',NOW)).toBe('received');expect(getBuyState(db,'m4','park',NOW)).toBe('sold');db=step(db,{type:'item/undoReceipt',id:'m4'});db=step(db,{type:'admin/restrict',userId:'kim',kinds:['purchase'],duration:'1d',reason:'구매 제한 근거를 확인합니다'},'ops');expect(getBuyState(db,'m4','kim',NOW)).toBe('restricted');
 });
 it('undo removes reversed transactions from repeated-trade monitoring evidence',()=>{
  let db=seed();for(const id of ['m4','m3']){db=designate(db,id);db=step(db,{type:'item/confirmReceipt',id});db=step(db,{type:'item/undoReceipt',id});}expect(detectFlags(db,NOW).flatMap(f=>f.evidence).some(e=>e.kind==='tx'&&db.transactions.find(t=>t.id===e.refId)?.reversedAt)).toBe(false);
 });
});
describe('market CRUD and validation regression',()=>{
 it.each(['m1','m3'])('seller can update/delete unsold %s',id=>{const before=seed(),seller=item(before,id).sellerId,after=step(before,{type:'item/update',id,patch:{title:'수정된 물품명'}},seller);expect(item(after,id).title).toBe('수정된 물품명');expect(step(after,{type:'item/delete',id},seller).items.some(i=>i.id===id)).toBe(false);});
 it.each(['item/sellTo','item/reserve','item/releaseReservation','item/update','item/delete'] as const)('sold blocks %s',type=>fails(seed(),{type,id:'m8',userId:'kim',patch:{}} as Action,'han','INVALID_STATE'));
 it.each(['m1','m3','m8'])('like and view remain usable %s',id=>{const before=seed(),after=step(before,{type:'item/like',id},'lee');expect(item(after,id).likeCount).toBe(item(before,id).likeCount+1);expect(item(step(after,{type:'item/like',id},'lee'),id).likeCount).toBe(item(before,id).likeCount);expect(item(step(before,{type:'item/view',id},'ops'),id).views).toBe(item(before,id).views+1);});
 it.each([0,1,11,100010])('sale price %i invalid',price=>fails(seed(),{type:'item/create',input:{...itemInput(),mode:'sale',price}},'kim','VALIDATION'));
 it.each([10,100000])('sale endpoints %i accepted',price=>expect(step(seed(),{type:'item/create',input:itemInput(price)}).items).toHaveLength(9));
 it('free requires zero and photo/title limits remain enforced',()=>{fails(seed(),{type:'item/create',input:{...itemInput(),mode:'free',price:100}},'kim','VALIDATION');fails(seed(),{type:'item/create',input:{...itemInput(),photos:Array.from({length:6},(_,i)=>({id:String(i),source:'preset'}))}},'kim','VALIDATION');for(const title of ['a','a'.repeat(41)])fails(seed(),{type:'item/create',input:{...itemInput(),title}},'kim','VALIDATION');});
});
