'use client';
import { useEffect, useRef } from 'react';
import { characterAsset, type CharacterAppearance } from '@/lib/character';
import type { TierKey } from '@/lib/types';
export default function CharacterSprite({appearance,outfit,size=288,className=''}:{appearance:Pick<CharacterAppearance,'gender'|'hair'>;outfit:TierKey;size?:number;className?:string}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const src=characterAsset(appearance,outfit);
  useEffect(()=>{
    const node=canvas.current,ctx=node?.getContext('2d');if(!node||!ctx)return;
    let alive=true;node.dataset.loaded='false';ctx.clearRect(0,0,24,24);
    const image=new Image();image.onload=()=>{if(!alive)return;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,24,24);ctx.drawImage(image,0,0,24,24);node.dataset.loaded='true';};image.src=src;
    return()=>{alive=false;};
  },[src]);
  return <canvas ref={canvas} width={24} height={24} data-testid="pixel-sprite" data-name="character" data-tier={outfit} data-gender={appearance.gender} data-hair={appearance.hair} data-src={src} className={`oq-pixel-sprite character-art ${className}`} role="img" aria-label={`${appearance.gender==='male'?'남성':'여성'} 캐릭터 · ${outfit} 의상`} style={{width:size,height:size}}/>;
}
