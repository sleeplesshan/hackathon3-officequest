import { mulberry32 } from '@/lib/rng';
export interface Particle {x:number;y:number;vx:number;vy:number;life:number;born:number;size:number;name:'coin'|'gem'|'star'|'square';color:string;drag:number;phase:number;}
export const MAX_PARTICLES=120;
export function overlayParticles(variant:'post'|'clear',width:number,height:number):Particle[] {
 const rand=mulberry32(variant==='post'?71:41);const output:Particle[]=[];
 const particle=(x:number,y:number,born:number,name:Particle['name'],speed:number,angle:number,life:number,size:number,color='#4ade80')=>output.push({x,y,born,name,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life,size,color,drag:.8+rand()*2.2,phase:rand()*6.28});
 if(variant==='post'){for(let i=0;i<34;i++)particle(width*.52,height*.5,700,i%2?'coin':'star',300+rand()*1100,rand()*Math.PI*2,600+rand()*1100,2+Math.floor(rand()*3));}
 else {
  for(let i=0;i<46;i++)particle(width*.68,height*.6,700,'square',300+rand()*600,rand()*Math.PI*2,700+rand()*900,4+Math.floor(rand()*5),['#4ade80','#166534','#dcfce7'][i%3]);
  for(let i=0;i<36;i++)particle(width*.61,height*.62,720,(['coin','gem','star'] as const)[i%3]!,450+rand()*950,-Math.PI+rand()*Math.PI,900+rand()*800,3+Math.floor(rand()*3));
  for(let i=0;i<46;i++)particle(rand()*width,rand()*height-height*.25,720,(['coin','gem','star'] as const)[i%3]!,100+rand()*320,Math.PI*.5+(rand()-.5)*.5,1700,3+Math.floor(rand()*3));
 }
 return output.slice(0,MAX_PARTICLES);
}
export function burstParticles(x:number,y:number,at:number,seed:number):Particle[] {const rand=mulberry32(seed);return Array.from({length:5},(_,i)=>{const angle=-Math.PI*.5+(rand()-.5)*Math.PI*80/180;const speed=180+rand()*140;return {x,y,born:at,name:i%2?'star':'coin',vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:500+rand()*200,size:3,color:'#fbbf24',drag:0,phase:rand()*6.28};});}
