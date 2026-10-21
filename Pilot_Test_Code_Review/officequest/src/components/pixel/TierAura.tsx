'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import type { TierKey } from '@/lib/types';
import { TIER_ORDER } from '@/lib/formulas';
import { mulberry32 } from '@/lib/rng';
import { lightningPaths } from './lightning';
export const AURA_COLORS:Record<TierKey,string[]>={bronze:['#cd7f32','#fbbf24'],silver:['#cbd5e1','#64748b'],gold:['#fbbf24','#fcd34d'],platinum:['#67e8f9','#22d3ee'],diamond:['#a5f3fc','#0891b2'],master:['#c084fc','#a855f7','#faf5ff']};
export function TierAura({tier,className=''}:{tier:TierKey;className?:string}) {
 const [tick,setTick]=useState(0);const index=TIER_ORDER.indexOf(tier);const colors=AURA_COLORS[tier];const rand=mulberry32(index+17);
 useEffect(()=>{if(tier!=='master'||document.documentElement.hasAttribute('data-test-mode')||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const timer=setInterval(()=>setTick(x=>x+1),62.5);return()=>clearInterval(timer);},[tier]);
 const count=index===0?0:index>=3?16:9;
 return <div className={`oq-tier-aura ${className}`} data-tier={tier} aria-hidden="true" style={{'--aura-color':`${colors[0]}38`} as CSSProperties}>{Array.from({length:count},(_,i)=>{const size=[6,8,10][i%3]!;return <i key={i} style={{left:`${Math.round(rand()*86+7)}%`,top:`${Math.round(rand()*60+24)}%`,width:size,height:size,background:colors[i%colors.length],animationDelay:`-${(rand()*1.8).toFixed(2)}s`,animationDuration:`${(.9+rand()*.9).toFixed(2)}s`}}/>;})}{tier==='master'&&<svg className="oq-lightning" viewBox="0 0 320 320">{lightningPaths(tick,320,320).map((d,i)=><g key={i} fill="none" strokeLinejoin="miter"><path d={d} stroke="#a855f7" opacity=".35" strokeWidth="10"/><path d={d} stroke="#c084fc" strokeWidth="4"/><path d={d} stroke="#faf5ff" strokeWidth="1.6"/></g>)}</svg>}</div>;
}
export default TierAura;
