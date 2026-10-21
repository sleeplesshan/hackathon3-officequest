'use client';
import type { User } from '@/lib/types';
import type { HyperPayload } from '@/lib/test-hooks';
import { tierForExp } from '@/lib/formulas';
import PixelSprite from '../pixel/PixelSprite';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function HyperFramePost({payload,worker,elapsed,reduced=false}:{payload:HyperPayload;worker:User;elapsed:number;reduced?:boolean}) {
 const flight=clamp((elapsed-350)/350);const impact=elapsed>=700&&elapsed<900;const jump=clamp((elapsed-350)/200);const bounty=payload.bounty??300;
 return <div className={`oq-hf-post ${reduced?'is-reduced':''}`}>
  {!reduced&&<><div className="oq-hf-rays" style={{opacity:elapsed>=700?.5:0,transform:`translate(-50%,-50%) rotate(${elapsed*.018}deg)`}}/><div className="oq-hf-flash" style={{opacity:impact?Math.sin((elapsed-700)/200*Math.PI):0}}/><div className="oq-hf-post-character" style={{transform:`translateX(${Math.round(-220*(1-clamp(elapsed/250)))}px) translateY(${Math.round(-Math.sin(jump*Math.PI)*46)}px) rotate(${Math.round(-Math.sin(jump*Math.PI)*6)}deg)`}}><PixelSprite tier={tierForExp(worker.exp)} scale={12}/></div><div className="oq-hf-board" style={{transform:`scale(${.82+.18*clamp(elapsed/300)})`}}>{Array.from({length:4},(_,i)=><i key={i} className={`oq-hf-note note-${i}`}><b/><span/><span/><span/></i>)}</div><div className="oq-hf-parchment" style={{transform:`translate(${Math.round(-560*(1-flight))}px,${Math.round(90*(1-flight))}px) scale(${.35+.65*flight+(impact?Math.sin((elapsed-700)/200*Math.PI)*.14:0)}) rotate(${Math.round(-220*(1-flight))}deg)`,opacity:elapsed>=350?1:0}}><PixelSprite name="scroll" scale={12}/>{elapsed>=700&&<i className="oq-hf-pin"/>}</div></>}
  <header className="oq-hf-heading"><h1 data-testid="hyperframe-title">QUEST <em>POSTED!</em></h1></header>
  <p className="oq-hf-post-caption" style={{opacity:reduced||elapsed>=800?1:0}}>퀘스트가 게시판에 등록되었습니다 · <strong>현상금 {bounty.toLocaleString('ko-KR')} P 에스크로 보관</strong></p>
 </div>;
}
export default HyperFramePost;
