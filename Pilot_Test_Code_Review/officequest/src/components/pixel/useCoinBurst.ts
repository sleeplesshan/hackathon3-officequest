'use client';
import { useCallback } from 'react';
export function emitCoinBurst(target:HTMLElement|{currentTarget:HTMLElement}):void {if(typeof window==='undefined')return;const element='currentTarget' in target?target.currentTarget:target;const rect=element.getBoundingClientRect();window.dispatchEvent(new CustomEvent('oq:coin-burst',{detail:{x:Math.round(rect.left+rect.width/2),y:Math.round(rect.top+rect.height/2)}}));}
export function useCoinBurst(){return useCallback(emitCoinBurst,[]);}
export default useCoinBurst;
