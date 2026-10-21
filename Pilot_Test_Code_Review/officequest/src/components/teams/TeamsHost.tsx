'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/lib/db/useDb';
import type { DB } from '@/lib/types';
import type { TeamsRecord } from '@/lib/test-hooks';
import TeamsFloating from './TeamsFloating';
export function openTeamsChat(key:string):void {if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('oq:teams-open',{detail:key}));}
export function TeamsHost(){
 const {db,user,personaId}=useDb();const [mounted,setMounted]=useState(false);const [key,setKey]=useState<string|null>(null);const [forcedTyping,setForcedTyping]=useState<string|null>(null);const opener=useRef<HTMLElement|null>(null);const lastPending=useRef(new Map<string,string>());const records=useRef(new Map<string,TeamsRecord>());
 useEffect(()=>{setMounted(true);const open=(event:Event)=>{const threadKey=(event as CustomEvent<string>).detail;if(typeof threadKey==='string'){opener.current=document.activeElement as HTMLElement|null;setKey(threadKey);setForcedTyping(null);}};const typing=(event:Event)=>{if(!window.__OQ_TEST__)return;const threadKey=(event as CustomEvent<string>).detail;if(typeof threadKey==='string')setForcedTyping(threadKey);};window.addEventListener('oq:teams-open',open);window.addEventListener('oq:typing',typing);return()=>{window.removeEventListener('oq:teams-open',open);window.removeEventListener('oq:typing',typing);};},[]);
 useEffect(()=>{if(!db)return;for(const thread of Object.values(db.teams)){const previous=lastPending.current.get(thread.key);if(previous&&!thread.pendingReplyFor){const record=records.current.get(previous);const sentIndex=thread.messages.findIndex(m=>m.id===previous);const sent=thread.messages[sentIndex];const replied=sentIndex>=0&&thread.messages.slice(sentIndex+1).some(m=>m.from!=='system'&&m.senderId!==sent?.senderId);if(record&&record.replyAt===null&&replied)record.replyAt=performance.now();records.current.delete(previous);}if(thread.pendingReplyFor)lastPending.current.set(thread.key,thread.pendingReplyFor);else lastPending.current.delete(thread.key);}for(const [thread,pending] of lastPending.current){if(!db.teams[thread]){lastPending.current.delete(thread);records.current.delete(pending);}}},[db]);
 const sent=useCallback((next:DB,sentAt:number)=>{if(!key)return;setForcedTyping(null);const pending=next.teams[key]?.pendingReplyFor;if(pending&&window.__OQ_TEST__){const record:TeamsRecord={threadKey:key,sentAt,replyAt:null};window.__OQ_TEST__.teams.push(record);records.current.set(pending,record);lastPending.current.set(key,pending);}},[key]);
 if(!mounted||!db||!user||user.role!=='player'||!key)return null;const thread=db.teams[key];if(!thread||!thread.participants.includes(personaId))return null;const other=db.users[thread.participants.find(id=>id!==personaId)!];if(!other)return null;
 return createPortal(<TeamsFloating key={`${key}:${personaId}`} thread={thread} other={other} forcedTyping={forcedTyping===key} onClose={()=>{setKey(null);setForcedTyping(null);if(opener.current?.isConnected)opener.current.focus({preventScroll:true});}} onSent={sent}/>,document.body);
}
export default TeamsHost;
