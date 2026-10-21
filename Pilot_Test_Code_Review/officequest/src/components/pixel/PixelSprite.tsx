'use client';
import { useEffect, useRef, type CSSProperties } from 'react';
import type { TierKey } from '@/lib/types';
import { TIER_ORDER } from '@/lib/formulas';
import { drawSprite, getSprite } from './sprites';
export interface PixelSpriteProps {name?:string;tier?:TierKey;scale:number;className?:string;style?:CSSProperties;}
export function PixelSprite({name='character',tier='bronze',scale,className='',style}:PixelSpriteProps){
 const canvas=useRef<HTMLCanvasElement>(null);const sprite=getSprite(name,tier);const zoom=Math.max(1,Math.floor(scale));
 useEffect(()=>{const ctx=canvas.current?.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,sprite.w,sprite.h);drawSprite(ctx,sprite);},[sprite]);
 const explicitTier=/^(char|head)[0-5]$/.test(name)?TIER_ORDER[Number(name.slice(-1))]!:tier;
 return <canvas ref={canvas} width={sprite.w} height={sprite.h} className={`oq-pixel-sprite ${className}`} data-testid="pixel-sprite" data-name={name} data-tier={explicitTier} aria-hidden="true" style={{position:'relative',inset:'auto',display:'inline-block',width:sprite.w*zoom,height:sprite.h*zoom,imageRendering:'pixelated',flexShrink:0,verticalAlign:'middle',...style}}/>;
}
export default PixelSprite;
