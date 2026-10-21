'use client';
import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { LockKeyhole, X } from 'lucide-react';
import type { QuestStatus, TierKey, User } from '@/lib/types';
import { level, tierForExp, TIER_LABELS } from '@/lib/formulas';
import PixelSprite from '@/components/pixel/PixelSprite';
import { playHoverSound } from '@/lib/audio';
import { emitCoinBurst } from '@/components/pixel/useCoinBurst';

export function Button({ children, reason, variant = 'secondary', size = 'md', className = '', hoverSound = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { hoverSound?: boolean; reason?: string; variant?: 'primary' | 'secondary' | 'reject' | 'teams' | 'ghost'; size?: 'sm' | 'md' | 'lg'; 'data-testid'?: string }) {
  const id = useId(); const disabled = props.disabled;
  return <span className={`button-wrap ${disabled ? 'is-disabled' : ''}`}>
    <button {...props} onPointerEnter={event=>{props.onPointerEnter?.(event);if(!disabled&&hoverSound)playHoverSound(event);if(!disabled&&variant==='primary')emitCoinBurst(event.currentTarget);}} onClick={event=>{if(!disabled&&variant==='primary')emitCoinBurst(event.currentTarget);props.onClick?.(event);}} type={props.type ?? 'button'} aria-describedby={disabled && reason ? id : props['aria-describedby']} className={`btn ${variant === 'primary' ? 'pri' : variant === 'reject' ? 'rej' : variant === 'teams' ? 'btn-teams' : variant === 'ghost' ? 'ghost' : ''} ${size === 'md' ? '' : size} ${className}`}>
      {disabled && <LockKeyhole size={15} aria-hidden="true" />}{children}
    </button>
    {disabled && reason && <span id={id} className="disabled-explanation" data-testid="disabled-reason" data-for={props['data-testid']}>{reason}</span>}
    {disabled && reason && <span className="tooltip" role="tooltip" data-testid="tooltip">{reason}</span>}
  </span>;
}
export function Badge({ children, tone = '', className = '', ...props }: { children: ReactNode; tone?: string; className?: string; 'data-testid'?: string; 'data-status'?: string }) { return <span {...props} className={`badge s ${tone} ${className}`}>{children}</span>; }
const statusText: Record<QuestStatus, string> = { recruiting: '모집중', in_progress: '진행중', revision: '진행중 · 보완요청', done: '완료' };
export function StatusBadge({ status, testId }: { status: QuestStatus; testId?: string }) { return <Badge tone={{recruiting:'b-ok',in_progress:'',revision:'b-wait',done:'b-done'}[status]} data-testid={testId} data-status={status}>{statusText[status]}</Badge>; }
export function TypeBadge({ type }: { type: 'request' | 'inquiry' }) { return <Badge tone={type === 'inquiry' ? 'b-info' : ''}>{type === 'inquiry' ? '문의' : '요청'}</Badge>; }
export function TierBadge({ tier, children }: { tier: TierKey; children?: ReactNode }) { return <span className="badge s tier-badge" style={{background:`var(--tier-${tier}-bg)`,color:`var(--tier-${tier}-fg)`}}>{children ?? TIER_LABELS[tier]}</span>; }
export function Avatar({ user, size = 40 }: { user: User; size?: number }) { return <span className="avt" style={{width:size,height:size}} aria-label={`${user.name} 캐릭터`}><PixelSprite name="head" tier={tierForExp(user.exp)} scale={size < 30 ? 1 : 2} /></span>; }
export function UserLine({ user }: { user: User }) { return <div className="usr"><Avatar user={user}/><div><b>{user.name}</b><span>{user.dept} · {TIER_LABELS[tierForExp(user.exp)]} Lv.{level(user.exp)}</span></div></div>; }
export function ProgressBar({ value, testId }: { value: number; testId?: string }) { return <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} data-testid={testId}><i style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div>; }
export function ProgressRing({ value, testId }: { value: number; testId?: string }) { return <div className="progress-ring num" data-testid={testId}><svg viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="31" stroke="var(--accent-soft)" strokeWidth="9" fill="none"/><circle cx="38" cy="38" r="31" stroke="var(--accent)" strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray="194.8" strokeDashoffset={194.8*(1-value/4)}/></svg><b>{value}/4</b></div>; }
export function Modal({ title, children, onClose, testId, size = 'md', footer, className = '', variant }: { variant?: string; title: string; children: ReactNode; onClose: () => void; testId: string; size?: 'sm' | 'md' | 'lg'; footer?: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null); const label = useId(); const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    (root?.querySelector<HTMLElement>('[data-autofocus]') ?? root?.querySelector<HTMLElement>('input:not([disabled]),textarea:not([disabled]),button:not([disabled])') ?? root)?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key === 'Tab' && root) {
        const nodes = [...root.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex="0"]')].filter(x=>x.offsetParent!==null);
        const first=nodes[0],last=nodes.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    document.addEventListener('keydown', key); const overflow=document.body.style.overflow; document.body.style.overflow='hidden';
    return () => {document.removeEventListener('keydown',key);document.body.style.overflow=overflow;previous?.focus();};
  }, []);
  if(typeof document==='undefined')return null;
  return createPortal(<div className="modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}><div ref={ref} className={`modal-panel ${size} ${className}`} data-testid={testId} data-variant={variant} role="dialog" aria-modal="true" aria-labelledby={label} tabIndex={-1}><div className="modal-heading"><h2 id={label}>{title}</h2><button type="button" className="ib" onClick={onClose} aria-label="닫기"><X size={20}/></button></div>{children}{footer&&<div className="modal-footer">{footer}</div>}</div></div>, document.body);
}
export function ConfirmModal({ title, children, onClose, onConfirm }: { title: string; children: ReactNode; onClose: () => void; onConfirm: () => void }) { return <Modal title={title} testId="confirm-modal" onClose={onClose} footer={<><Button data-testid="confirm-cancel" onClick={onClose}>취소</Button><Button variant="primary" data-testid="confirm-ok" onClick={onConfirm}>확인하기</Button></>}>{children}</Modal>; }
