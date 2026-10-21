import { mulberry32 } from '@/lib/rng';
export function lightningPaths(tick:number,width:number,height:number):string[] {const rand=mulberry32(31+tick);return Array.from({length:3},(_,j)=>{const base=width*(.22+j*.28);return Array.from({length:7},(_,i)=>`${i===0?'M':'L'}${Math.round(base+(rand()-.5)*36)},${Math.round(height*(.12+i*.12))}`).join(' ');});}
