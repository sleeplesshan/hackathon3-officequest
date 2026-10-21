'use client';
import { Star } from 'lucide-react';
import type { User } from '@/lib/types';
import type { HyperPayload } from '@/lib/test-hooks';
import { RATING_EXP } from '@/lib/constants';
import { tier, TIER_LABELS, tierForExp } from '@/lib/formulas';
import PixelSprite from '../pixel/PixelSprite';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function HyperFrameClear({payload,worker,elapsed,reduced=false}:{payload:HyperPayload;worker:User;elapsed:number;reduced?:boolean}) {
 const stars=Math.max(1,Math.min(5,payload.stars??3)) as keyof typeof RATING_EXP;const from=payload.fromLv??Math.floor(worker.exp/100)+1;const to=payload.toLv??from+1;const bounty=payload.bounty??300;const reveal=reduced||elapsed>=1000;const result=reduced||elapsed>=850;
 const dash=clamp((elapsed-300)/200);const progress=1-(1-dash)**4;const bossAge=clamp((elapsed-700)/400);const phase=elapsed-450;
 const hit=elapsed>=550&&elapsed<720;const charStyle={transform:`translate(${Math.round(-470+progress*470)}px,${Math.round(-Math.sin(dash*Math.PI)*36)}px) rotate(${Math.round(-Math.sin(dash*Math.PI)*10)}deg)`};
 const arcProgress=clamp(phase/220);const radius=250;const points=Array.from({length:42},(_,i)=>{const a=-2.4+i/41*3.6;return [Math.cos(a)*radius,Math.sin(a)*radius] as const;});const arc=points.map(([x,y],i)=>`${i===0?'M':'L'}${x+300},${y+300}`).join(' ');
 return <div className={`oq-hf-clear ${reduced?'is-reduced':''}`}>
  {!reduced&&<><div className="oq-hf-floor"/><div className="oq-hf-rays" style={{opacity:elapsed>=720?.65:0,transform:`translate(-50%,-50%) rotate(${elapsed*.018}deg)`}}/><div className="oq-hf-flash" style={{opacity:hit?Math.sin(clamp((elapsed-550)/150)*Math.PI)*.85:0}}/>
   <div className="oq-hf-fighter" style={charStyle}><PixelSprite tier={tierForExp(worker.exp)} scale={12}/></div>
   <div className="oq-hf-boss" style={{transform:`translateX(${hit?Math.round(Math.sin(elapsed/15)*16):0}px)`}}><div className="oq-hf-boss-label">업무 병목 슬라임 · <em>보스</em></div><div className="oq-hf-hp"><i style={{width:`${100-clamp((elapsed-550)/150)*100}%`}}/></div><div style={{transform:`scale(${1+Math.sin(bossAge*Math.PI)*.18-bossAge*.7})`,opacity:1-bossAge*.85}}><PixelSprite name="slime" scale={14}/></div></div>
   <svg className="oq-hf-slash" viewBox="0 0 600 600" style={{opacity:elapsed>=450&&elapsed<1250?1:0}}><defs><filter id="oq-slash-glow"><feGaussianBlur stdDeviation="13"/></filter></defs><path d={arc} fill="none" stroke="#a855f7" strokeWidth="52" filter="url(#oq-slash-glow)" opacity=".8" pathLength="1" strokeDasharray={`${arcProgress} 1`}/>{points.slice(1).map(([x,y],i)=>{const previous=points[i]!;const d=`M${previous[0]+300},${previous[1]+300}L${x+300},${y+300}`;return <g key={i} opacity={(i+1)/41<=arcProgress?1:0}><path d={d} fill="none" stroke="#a855f7" strokeWidth={6+i/40*46} strokeLinecap="round"/><path d={d} fill="none" stroke="#faf5ff" strokeWidth={1.6+i/40*10} strokeLinecap="round" opacity={i%2===0?1:.45}/></g>;})}</svg>
   {elapsed>=550&&elapsed<720&&<strong className="oq-hf-critical">CRITICAL!</strong>}{elapsed>=650&&elapsed<1500&&<strong className="oq-hf-damage">-9,999</strong>}</>}
  <header className="oq-hf-heading" style={{opacity:reveal?1:0,transform:`scale(${reduced?1:1+.2*(1-clamp((elapsed-1000)/250))})`}}><h1 data-testid="hyperframe-title">{to>from?'LEVEL UP!':'QUEST CLEAR!'}</h1><div className="oq-hf-level-pill">{worker.name} · {TIER_LABELS[tier(from)]} Lv.{from} <span>→</span> Lv.{to}</div></header>
  <div className="oq-hf-rewards" style={{opacity:result?1:0}}>{[{name:'coin',value:'+100 P',label:'기본 보상',test:'base'},{name:'coin',value:`+${bounty.toLocaleString('ko-KR')} P`,label:'현상금',test:'bounty'},{name:'gem',value:`+${RATING_EXP[stars]} EXP`,label:'경험치',test:'exp'}].map((r,i)=><div className="oq-hf-reward" key={r.test} data-testid={`hyperframe-reward-${r.test}`} style={{transform:`translateY(${reduced?0:Math.round((1-clamp((elapsed-850-i*80)/300))*40)}px)`}}><PixelSprite name={r.name} scale={4}/><strong>{r.value}</strong><span>{r.label}</span></div>)}<div className="oq-hf-stars" data-testid="hyperframe-stars" data-stars={stars}>{Array.from({length:5},(_,i)=><Star key={i} size={20} fill={i<stars?'#fbbf24':'none'} color={i<stars?'#fbbf24':'#71717a'}/>)}<span>별 {stars}개</span></div></div>
  <p className="oq-hf-caption" style={{opacity:result?1:0}}>퀘스트 완료 승인 · <strong>보상이 {worker.name}에게 즉시 지급되었습니다</strong> · 1.8초 후 자동 닫힘</p>
 </div>;
}
export default HyperFrameClear;
