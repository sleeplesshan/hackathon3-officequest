'use client';
import { useEffect, useRef } from 'react';
import { drawSprite, getSprite } from './sprites';
import { burstParticles, MAX_PARTICLES, overlayParticles, type Particle } from './particles';
export interface ParticleCanvasProps {variant?:'post'|'clear';startedAt?:number;freezeAtMs?:number;reduced?:boolean;opacity?:number;}
export function ParticleCanvas({variant,startedAt=0,freezeAtMs,reduced=false,opacity=1}:ParticleCanvasProps){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  let animation=0;let width=window.innerWidth,height=window.innerHeight;let particles=variant?overlayParticles(variant,width,height):[];let bursts:Particle[]=[];let seed=121;
  const resize=()=>{width=window.innerWidth;height=window.innerHeight;canvas.width=width;canvas.height=height;particles=variant?overlayParticles(variant,width,height):[];};resize();
  const burst=(event:Event)=>{if(variant||reduced||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const {x,y}=(event as CustomEvent<{x:number;y:number}>).detail;bursts=[...bursts,...burstParticles(x,y,performance.now(),seed++)].slice(-MAX_PARTICLES);if(!animation)animation=requestAnimationFrame(frame);};
  const paint=(list:Particle[],time:number,gravity:number)=>{for(const p of list){const age=time-p.born;if(age<0||age>p.life)continue;const t=age/1000;const drag=(1-Math.exp(-p.drag*t))/(p.drag||1);const move=p.drag?drag:t;const x=Math.round((p.x+p.vx*move)/2)*2;const y=Math.round((p.y+p.vy*t+.5*gravity*t*t)/2)*2;ctx.globalAlpha=1-(age/p.life)**3;if(p.name==='square'){ctx.fillStyle=p.color;ctx.fillRect(x,y,p.size*2,p.size*2);}else{ctx.save();ctx.translate(x,y);ctx.scale(p.name==='coin'?Math.cos(t*9+p.phase):1,1);drawSprite(ctx,getSprite(p.name),0,0,p.size);ctx.restore();}}ctx.globalAlpha=1;};
  const frame=()=>{const now=performance.now();ctx.clearRect(0,0,width,height);if(!reduced){if(variant)paint(particles,freezeAtMs??now-startedAt,variant==='clear'?1000:900);bursts=bursts.filter(p=>now-p.born<p.life);paint(bursts,now,900);}animation=(!reduced&&((variant&&freezeAtMs===undefined)||bursts.length>0))?requestAnimationFrame(frame):0;};animation=requestAnimationFrame(frame);
  const resized=()=>{resize();if(!animation)animation=requestAnimationFrame(frame);};window.addEventListener('resize',resized);window.addEventListener('oq:coin-burst',burst);
  return()=>{cancelAnimationFrame(animation);window.removeEventListener('resize',resized);window.removeEventListener('oq:coin-burst',burst);};
 },[variant,startedAt,freezeAtMs,reduced]);
 return <canvas ref={ref} className="oq-particle-canvas" data-testid="particle-canvas" aria-hidden="true" style={{opacity}}/>;
}
export default ParticleCanvas;
