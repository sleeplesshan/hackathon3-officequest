'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Maximize2, Minus, Send, X } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { canAction } from '@/lib/guards';
import { useDb } from '@/lib/db/useDb';
import { VILLAGE_LABELS } from '@/lib/db/seed';
import { formatKstDate } from '@/lib/formulas';
import type { DB, TeamsMessage, TeamsThread, User } from '@/lib/types';
import '@/styles/teams.css';
export interface TeamsFloatingProps {thread:TeamsThread;other:User;forcedTyping?:boolean;onClose:()=>void;onSent:(next:DB,sentAt:number)=>void;}
export function TeamsFloating({thread,other,forcedTyping=false,onClose,onSent}:TeamsFloatingProps){
 const {db,personaId,now,dispatch}=useDb();const [draft,setDraft]=useState('');const [minimized,setMinimized]=useState(false);const body=useRef<HTMLDivElement>(null);const input=useRef<HTMLInputElement>(null);const heading=useId();const reasonId=useId();const pending=!!thread.pendingReplyFor;const typing=pending||forcedTyping;
 useEffect(()=>{if(!minimized)input.current?.focus({preventScroll:true});},[thread.key,minimized]);
 useEffect(()=>{if(body.current)body.current.scrollTop=body.current.scrollHeight;},[thread.messages.length,typing,minimized]);
 if(!db)return null;
 const guard=canAction(db,{type:'teams/send',threadKey:thread.key,text:draft},personaId,now);const disabled=!guard.ok;
 const reason=pending?'상대방의 답장을 기다리고 있어요':!draft.trim()?'메시지를 입력해 주세요':guard.ok?undefined:guard.reason;
 const send=()=>{if(disabled)return;const sentAt=performance.now();const next=dispatch({type:'teams/send',threadKey:thread.key,text:draft});if(next){onSent(next,sentAt);setDraft('');input.current?.focus();}};
 const from=(message:TeamsMessage):TeamsMessage['from']=>message.from==='system'?'system':message.senderId?message.senderId===personaId?'me':'them':message.from;
 return <section className={`oq-teams-floating ${minimized?'is-minimized':''}`} data-testid="teams-chat" data-context={thread.context} role="region" aria-labelledby={heading}>
  <header className="oq-teams-header" data-testid="teams-header"><div className="oq-teams-logo" aria-hidden="true">T</div><div className="oq-teams-avatar"><Avatar user={other} size={42}/><i aria-label="온라인"/></div><div className="oq-teams-who"><h2 id={heading}>{other.name}</h2><p>{other.dept} · {VILLAGE_LABELS[other.village]} · 대화 가능</p><span className="oq-teams-context">{thread.context==='handover'?'업무 인수인계':'중고거래'}</span></div><div className="oq-teams-window-controls"><button type="button" aria-label={minimized?'대화 펼치기':'대화 최소화'} aria-expanded={!minimized} onClick={()=>setMinimized(!minimized)}>{minimized?<Maximize2 size={16}/>:<Minus size={18}/>}</button><button type="button" data-testid="teams-close" aria-label="Teams 대화 닫기" onClick={onClose}><X size={18}/></button></div></header>
  {!minimized&&<><div ref={body} className="oq-teams-messages" role="log" aria-live="polite" aria-relevant="additions text">{thread.messages.map(message=>{const direction=from(message);const sender=message.senderId?db.users[message.senderId]:undefined;return direction==='system'?<div key={message.id} className="oq-teams-system" data-testid="teams-msg" data-from="system">{message.text}</div>:<div className={`oq-teams-message ${direction}`} key={message.id} data-testid="teams-msg" data-from={direction}><span className="oq-teams-message-meta">{sender?.name??(direction==='me'?'나':other.name)} · <time dateTime={message.at}>{formatKstDate(message.at).slice(-5)}</time></span><p>{message.text}</p></div>;})}{typing&&<div className="oq-teams-typing" data-testid="teams-typing" role="status"><span className="oq-teams-dots" aria-hidden="true"><i/><i/><i/></span><span>{other.name}님이 입력 중입니다...</span></div>}</div>
  <form className="oq-teams-inputbar" onSubmit={event=>{event.preventDefault();send();}}><label className="sr-only" htmlFor={`${heading}-input`}>Teams 메시지</label><input id={`${heading}-input`} ref={input} data-testid="teams-input" value={draft} onChange={event=>setDraft(event.target.value)} placeholder="메시지 입력" autoComplete="off" onKeyDown={event=>{if(event.nativeEvent.isComposing&&event.key==='Enter')event.preventDefault();}}/><span className={`oq-teams-send-wrap ${disabled?'is-disabled':''}`}><button type="submit" data-testid="teams-send" aria-label="메시지 전송" disabled={disabled} aria-describedby={disabled?reasonId:undefined}><Send size={19}/></button>{disabled&&<span id={reasonId} className="oq-teams-send-reason" role="tooltip">{reason}</span>}</span></form></>}
 </section>;
}
export default TeamsFloating;
