'use client';
import { useId, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useDb } from '@/lib/db/useDb';
import { canAction } from '@/lib/guards';
import { FLAG_LABELS } from '@/lib/monitoring';
import type { Flag } from '@/lib/types';
export function DismissModal({flag,onClose}:{flag:Flag;onClose:()=>void}){const {db,user,now,dispatch,toast}=useDb();const [reason,setReason]=useState('');const id=useId();if(!db||!user)return null;const action={type:'admin/dismissFlag' as const,flagId:flag.id,reason};const guard=canAction(db,action,user.id,now);function submit(){if(!db||!user)return;const checked=canAction(db,action,user.id,now);if(!checked.ok){toast(checked.reason,'danger');return;}if(dispatch(action)){toast('무혐의 처리하고 감사 로그에 기록했어요');onClose();}}return <Modal title="무혐의 처리" testId="dismiss-modal" className="admin-modal" onClose={onClose} footer={<><Button onClick={onClose}>취소</Button><Button variant="primary" data-testid="dismiss-confirm" disabled={!guard.ok} reason={guard.ok?undefined:guard.reason} onClick={submit}><CheckCircle2 size={17}/>무혐의 처리</Button></>}><div className="admin-modal-intro"><CheckCircle2 size={23}/><div><b>{FLAG_LABELS[flag.rule]}</b><p>확인한 근거와 무혐의 처리 사유를 기록해 주세요.</p></div></div><div className="admin-modal-subjects">{flag.subjects.map(id=>db.users[id]?.name??id).join(' · ')} · 근거 {flag.evidence.length}건</div><label className="admin-field" htmlFor={id}>처리 사유 <small>{reason.trim().length}/100 · 5자 이상</small><textarea id={id} data-autofocus data-testid="dismiss-reason-input" rows={4} maxLength={100} value={reason} onChange={e=>setReason(e.target.value)} placeholder="근거를 검토한 내용을 적어 주세요"/></label></Modal>;}
export default DismissModal;
