'use client';
import { useId, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useDb } from '@/lib/db/useDb';
import { canAction } from '@/lib/guards';
import { RESTRICTION_LABELS } from '@/lib/restrictions';
import { formatKstDate } from '@/lib/formulas';
import type { Restriction } from '@/lib/types';
export function LiftModal({restriction,onClose}:{restriction:Restriction;onClose:()=>void}){const {db,user,now,dispatch,toast}=useDb();const [reason,setReason]=useState('');const id=useId();if(!db||!user)return null;const action={type:'admin/lift' as const,restrictionId:restriction.id,reason};const guard=canAction(db,action,user.id,now);function submit(){if(!db||!user)return;const checked=canAction(db,action,user.id,now);if(!checked.ok){toast(checked.reason,'danger');return;}if(dispatch(action)){toast('제재를 해제하고 감사 로그에 기록했어요');onClose();}}return <Modal title="제재 해제" testId="lift-modal" className="admin-modal" onClose={onClose} footer={<><Button onClick={onClose}>취소</Button><Button variant="primary" data-testid="lift-confirm" disabled={!guard.ok} reason={guard.ok?undefined:guard.reason} onClick={submit}><ShieldCheck size={17}/>해제하기</Button></>}><div className="admin-modal-intro"><ShieldCheck size={23}/><div><b>{db.users[restriction.userId]?.name} · {RESTRICTION_LABELS[restriction.kind]}</b><p>{formatKstDate(restriction.startsAt)}부터 · {restriction.endsAt?formatKstDate(restriction.endsAt)+'까지':'해제 시까지'}</p></div></div><div className="admin-existing-reason"><span>기존 제재 사유</span><p>{restriction.reason}</p></div><label className="admin-field" htmlFor={id}>해제 사유 <small>{reason.trim().length}/100 · 5자 이상</small><textarea id={id} data-autofocus data-testid="lift-reason-input" rows={4} maxLength={100} value={reason} onChange={e=>setReason(e.target.value)} placeholder="소명 확인 등 해제 사유를 적어 주세요"/></label></Modal>;}
export default LiftModal;
