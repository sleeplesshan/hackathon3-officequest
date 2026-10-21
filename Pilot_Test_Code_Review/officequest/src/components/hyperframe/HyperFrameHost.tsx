'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDb } from '@/lib/db/useDb';
import { HYPERFRAME_MS } from '@/lib/constants';
import type { HyperOptions, HyperPayload, HyperRecord } from '@/lib/test-hooks';
import ParticleCanvas from '../pixel/ParticleCanvas';
import HyperFramePost from './HyperFramePost';
import HyperFrameClear from './HyperFrameClear';
export interface HyperFrameRequest {variant:'post'|'clear';payload:HyperPayload;onDone?:()=>void;options?:HyperOptions;}
interface QueuedFrame extends HyperFrameRequest {id:number;}
export function HyperFrameHost(){
 const {db,user}=useDb();const [mounted,setMounted]=useState(false);const [queue,setQueue]=useState<QueuedFrame[]>([]);const [elapsed,setElapsed]=useState(0);const [startedAt,setStartedAt]=useState(0);const [reduced,setReduced]=useState(false);const [frozen,setFrozen]=useState<number|undefined>();const id=useRef(0);const overlay=useRef<HTMLDivElement>(null);const active=queue[0];
 useEffect(()=>{setMounted(true);const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);const receive=(event:Event)=>{const detail=(event as CustomEvent<HyperFrameRequest>).detail;if(!detail||!['post','clear'].includes(detail.variant))return;setQueue(q=>[...q,{...detail,payload:detail.payload??{},id:++id.current}]);};window.addEventListener('oq:hyperframe',receive);return()=>{window.removeEventListener('oq:hyperframe',receive);media.removeEventListener('change',update);};},[]);
 useEffect(()=>{
  if(!active)return;const openedAt=performance.now();const record:HyperRecord={variant:active.variant,openedAt,closedAt:null,frames:0};window.__OQ_TEST__?.hyperframes.push(record);setStartedAt(openedAt);
  let freeze:number|undefined;try{if(localStorage.getItem('oq:test')==='1'&&active.options?.freezeAtMs!==undefined)freeze=Math.max(0,Math.min(HYPERFRAME_MS,active.options.freezeAtMs));}catch{/* test freezing is optional */}setFrozen(freeze);setElapsed(freeze??0);
  const previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';overlay.current?.focus({preventScroll:true});
  const focus=(event:FocusEvent)=>{if(overlay.current&&!overlay.current.contains(event.target as Node))overlay.current.focus({preventScroll:true});};document.addEventListener('focusin',focus);
  let raf=0;const tick=()=>{record.frames++;if(freeze===undefined)setElapsed(performance.now()-openedAt);raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
  const timer=freeze===undefined?setTimeout(()=>{record.closedAt=performance.now();setQueue(q=>q.filter(frame=>frame.id!==active.id));try{active.onDone?.();}catch{/* the scene still closes if a route callback fails */}},HYPERFRAME_MS):undefined;
  return()=>{cancelAnimationFrame(raf);if(timer!==undefined)clearTimeout(timer);if(record.closedAt===null)record.closedAt=performance.now();document.body.style.overflow=overflow;document.removeEventListener('focusin',focus);if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[active]);
 if(!mounted)return null;
 const worker=(active?.payload.worker?db?.users[active.payload.worker]:user)??db?.users.kim;
 const fadeIn=reduced?200:150;const fadeOut=reduced?1600:1500;const fade=frozen!==undefined?1:elapsed<fadeIn?Math.max(0,elapsed/fadeIn):elapsed>=fadeOut?Math.max(0,1-(elapsed-fadeOut)/(HYPERFRAME_MS-fadeOut)):1;
 return createPortal(<>{active&&worker&&<div ref={overlay} className={`oq-hyperframe ${reduced?'is-reduced':''}`} role="dialog" aria-modal="true" aria-label={active.variant==='clear'?'퀘스트 완료 보상':'퀘스트 등록 완료'} tabIndex={-1} data-testid="hyperframe" data-variant={active.variant} data-elapsed={Math.round(elapsed)} style={{opacity:fade,zIndex:9999}} onKeyDown={event=>{if(event.key==='Escape'||event.key==='Tab'){event.preventDefault();event.stopPropagation();overlay.current?.focus();}}}>{active.variant==='clear'?<HyperFrameClear payload={active.payload} worker={worker} elapsed={elapsed} reduced={reduced}/>:<HyperFramePost payload={active.payload} worker={worker} elapsed={elapsed} reduced={reduced}/>}</div>}<ParticleCanvas variant={active?.variant} startedAt={startedAt} freezeAtMs={frozen} reduced={reduced} opacity={active?fade:1}/></>,document.body);
}
export default HyperFrameHost;
