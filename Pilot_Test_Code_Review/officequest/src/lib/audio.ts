export type SoundCue = 'coin'|'quest'|'trade'|'undo'|'success'|'warning'|'message'|'like'|'hover';
let context:AudioContext|null=null;
let muted=false;
let voices=0;
const active=new Set<OscillatorNode>();
let initialized=false;
const MAX_VOICES=16;
let lastHoverAt=-Infinity;
// Hover cannot unlock browser audio; first pointer/key activation still owns that.
export function playHoverSound(event:{pointerType:string}){
 if(event.pointerType!=='mouse'||typeof window==='undefined'||document.hidden||context?.state!=='running')return;
 const at=performance.now();if(at-lastHoverAt<120)return;lastHoverAt=at;playSound('hover');
}
export function soundMuted(){if(typeof window!=='undefined'&&!initialized){try{muted=localStorage.getItem('oq:audio:muted')==='true';}catch{/* optional preference */}initialized=true;}return muted;}
export function setSoundMuted(value:boolean){muted=value;initialized=true;try{localStorage.setItem('oq:audio:muted',String(value));}catch{/* preference stays in memory */}if(value)pauseAudio();else unlockAudio();window.dispatchEvent(new CustomEvent('oq:audio-setting',{detail:value}));}
export function unlockAudio(){if(typeof window==='undefined'||soundMuted()||document.hidden)return;try{context??=new AudioContext();if(context.state==='suspended')void context.resume().catch(()=>{});}catch{/* browsers without Web Audio retain visual feedback */}}
export function pauseAudio(){for(const oscillator of active){try{oscillator.stop();oscillator.disconnect();}catch{/* already stopped */}}active.clear();voices=0;if(context?.state==='running')void context.suspend().catch(()=>{});}
export function playSound(cue:SoundCue){
 if(typeof window==='undefined')return;
 const emit=(played:boolean,count=0)=>window.dispatchEvent(new CustomEvent('oq:sound',{detail:{cue,played,voices:count,activeVoices:voices,muted:soundMuted()}}));
 if(soundMuted()||document.hidden){emit(false);return;}unlockAudio();const ctx=context;if(!ctx||ctx.state!=='running'){emit(false);return;}
 const patterns:Record<SoundCue,number[]>={coin:[988,1319,1568,2093],quest:[523,659,784,1047,1319,1568],trade:[659,784,1047,1319,2093],undo:[784,659,523],success:[659,880],warning:[220,196],message:[880,1175],like:[1319],hover:[1568,2093]};
 let count=0;
 for(const [i,frequency] of patterns[cue].entries()){
  if(voices>=MAX_VOICES)break;
  const oscillator=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+(cue==='quest'?0.72:0.015)+i*(cue==='quest'?0.09:cue==='hover'?0.035:0.055),duration=cue==='warning'?0.14:cue==='hover'?0.045:0.12;
  oscillator.type=cue==='coin'||cue==='trade'?'square':'triangle';oscillator.frequency.setValueAtTime(frequency,start);oscillator.frequency.exponentialRampToValueAtTime(frequency*1.025,start+duration);
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(cue==='warning'?0.035:cue==='hover'?0.009:0.025,start+0.006);gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);
  oscillator.connect(gain);gain.connect(ctx.destination);voices++;count++;active.add(oscillator);oscillator.onended=()=>{if(active.delete(oscillator))voices--;oscillator.disconnect();gain.disconnect();};oscillator.start(start);oscillator.stop(start+duration+0.01);
 }
 emit(count>0,count);
}
