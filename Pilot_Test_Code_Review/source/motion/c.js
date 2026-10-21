(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const stage=$('#stage'),DUR=20;
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,lerp=(a,b,p)=>a+(b-a)*p;
const E={lin:p=>p,out:p=>1-Math.pow(1-p,3),in:p=>p*p*p,io:p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,
 expo:p=>p>=1?1:1-Math.pow(2,-10*p),back:p=>{const c=1.70158;return 1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2)},
 bk2:p=>{const c=2.6;return 1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2)}};
const pr=(t,a,b,e='out')=>E[e](clamp((t-a)/(b-a)));
const bump=(t,a,d)=>{const p=(t-a)/d;return p<0||p>1?0:Math.sin(p*Math.PI)};
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const fmt=n=>Math.round(n).toLocaleString('en-US');

/* ================= PIXEL SPRITE ENGINE ================= */
const BASE=[
"....KKKKKKKK....",
"...KHHHHHHHHK...",
"..KHHHHHHHHHHK..",
"..KHHSSSSSSHHK..",
"..KHSSSSSSSSHK..",
"..KSSEESSEESSK..",
"..KSSSSSSSSSSK..",
"...KSSSssSSSK...",
"....KKSSSSKK....",
"..KJJJWTTWJJJK..",
".KJJJJWTTWJJJJK.",
".KSJJJJTTJJJJSK.",
".KKKjjjjjjjjKKK.",
"...KPPPPPPPPK...",
"...KPPPKKPPPK...",
"...KBBBKKBBBK..."];
const WING=[".....C","...CCD","..CDDW",".CDDWD","CDDWDD","CDWDD.","CDDD..","CDD...","CD....","C....."];
const TIERS=[
 {J:'#3f4a6b',j:'#2b3350',pin:'#cd7f32'},
 {J:'#3f4a6b',j:'#2b3350',pin:'#e2e8f0',cape:['#cbd5e1','#64748b']},
 {J:'#f5b301',j:'#b7791f',pin:'#fff7cc',cape:['#b91c1c','#7f1d1d'],pads:1},
 {J:'#e5e7eb',j:'#9ca3af',pin:'#67e8f9',cape:['#64748b','#334155'],pads:1,gog:['#1f2937','#22d3ee']},
 {J:'#a5f3fc',j:'#0891b2',pin:'#ffffff',pads:1,gog:['#1f2937','#67e8f9'],wing:['#f0fdff','#67e8f9','#0e9fbf']},
 {J:'#7c3aed',j:'#4c1d95',pin:'#f0abfc',cape:['#581c87','#3b0764'],pads:1,gog:['#18181b','#f0abfc'],wing:['#faf5ff','#c084fc','#7e22ce'],sword:1}];
function charGrid(ti){
 const T=TIERS[ti],G=[...Array(24)].map(()=>Array(24).fill(null));
 const ok=(x,y)=>x>=0&&x<24&&y>=0&&y<24;
 const set=(x,y,c)=>{if(ok(x,y))G[y][x]=c},back=(x,y,c)=>{if(ok(x,y)&&!G[y][x])G[y][x]=c};
 const pal={K:'#1c1528',H:ti===5?'#2e1065':'#3b2718',S:'#f6c7a0',s:'#d99a73',E:'#18181b',W:'#f4f4f5',T:ti===2?'#b91c1c':'#7c3aed',J:T.J,j:T.j,P:'#2a2a35',B:'#121216'};
 const ox=4,oy=6;
 BASE.forEach((r,y)=>{for(let x=0;x<16;x++){const c=r[x];if(c!=='.')set(ox+x,oy+y,pal[c])}});
 set(ox+4,oy+10,T.pin);set(ox+11,oy+10,T.pin);
 if(T.pads){[[1,8,'K'],[2,8,'J'],[3,8,'J'],[12,8,'J'],[13,8,'J'],[14,8,'K'],[2,7,'K'],[3,7,'K'],[12,7,'K'],[13,7,'K']].forEach(([x,y,c])=>set(ox+x,oy+y,pal[c]))}
 if(T.gog){const g="GgggGGgggG";for(let i=0;i<10;i++)set(ox+3+i,oy+5,g[i]==='G'?T.gog[0]:T.gog[1]);set(ox+4,oy+5,'#ffffff');set(ox+9,oy+5,'#ffffff')}
 if(ti===5){set(ox+5,oy+0,'#f0abfc');set(ox+7,oy-1,'#f0abfc');set(ox+7,oy+0,'#e879f9');set(ox+9,oy+0,'#f0abfc');set(ox+10,oy-1,'#e879f9')}
 if(ti===2){[5,7,9].forEach(x=>set(ox+x+1,oy,'#fcd34d'))}
 if(T.sword){
  for(let y=2;y<=15;y++){set(20,y,'#f5f3ff');if(y>3)set(21,y,'#c084fc')}
  for(let x=18;x<=22;x++)set(x,16,x===18||x===22?'#f0abfc':'#a855f7');
  set(20,17,'#3b0764');set(20,18,'#3b0764');set(20,19,'#f0abfc');set(18,17,pal.S);set(19,17,pal.S);
 }
 if(T.cape){const[c0,c1]=T.cape;[[1,8,c1],[2,8,c0],[3,8,c0],[12,8,c0],[13,8,c0],[14,8,c1],[2,7,c1],[3,7,c1],[12,7,c1],[13,7,c1]].forEach(([x,y,c])=>{if(!T.pads||y>7)back(ox+x,oy+y,c)});
  for(let y=oy+9;y<=oy+15;y++){const e=Math.floor((y-oy-8)/3);for(let x=ox+1-e;x<=ox+14+e;x++)back(x,y,(x===ox+1-e||x===ox+14+e)?c1:c0)}}
 if(T.wing){const wc={C:T.wing[1],D:T.wing[2],W:T.wing[0]};WING.forEach((r,y)=>{for(let x=0;x<6;x++){const c=r[x];if(c!=='.'){back(x,8+y,wc[c]);back(23-x,8+y,wc[c])}}})}
 return G;
}
function gridCanvas(G){const h=G.length,w=G[0].length,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 G.forEach((r,y)=>r.forEach((col,i)=>{if(col){x.fillStyle=col;x.fillRect(i,y,1,1)}}));return c}
function strGrid(rows,pal){return rows.map(r=>[...r].map(ch=>ch==='.'?null:pal[ch]))}
const SP={};
for(let i=0;i<6;i++)SP['char'+i]=gridCanvas(charGrid(i));
const crop=(G,x0,y0,w,h)=>G.slice(y0,y0+h).map(r=>r.slice(x0,x0+w));
SP.head1=gridCanvas(crop(charGrid(1),4,5,16,13));SP.head2=gridCanvas(crop(charGrid(2),4,5,16,13));
SP.coin=gridCanvas(strGrid(["..KKKK..",".KYYYYK.","KYYWYYOK","KYWYYYOK","KYYYYYOK","KYYYYOOK",".KOOOOK.","..KKKK.."],{K:'#7c4a03',Y:'#fbbf24',O:'#d97706',W:'#fff7cc'}));
SP.gem=gridCanvas(strGrid(["..KKK..",".KCWCK.","KCWCCCK","KCCCCDK",".KCCDK.","..KCK..","...K..."],{K:'#3b0764',C:'#a855f7',W:'#f5d0fe',D:'#6d28d9'}));
SP.star=gridCanvas(strGrid(["...Y...","..YYY..","YYYWYYY",".YYYYY.","..YYY..",".YY.YY.","Y.....Y"],{Y:'#fde047',W:'#ffffff'}));
SP.scroll=gridCanvas(strGrid(["KKKKKKKKKKKK","KqQQQQQQQQqK",".KQQQQQQQQK.",".KQLLLLLLQK.",".KQQQQQQQQK.",".KQLLLLQQQK.",".KQQQQQQQQK.",".KQRRQQQQQK.","KqQRRQQQQQqK","KKKKKKKKKKKK"],{K:'#5b3a1e',Q:'#f3e2b3',q:'#c9a86a',L:'#a07a45',R:'#7c3aed'}));
SP.slime=gridCanvas(strGrid(["......KKKK......","....KKGGGGKK....","...KGGLLGGGGK...","..KGGLGGGGGGGK..","..KGGGGGGGGGGK..",".KGGEEGGGGEEGGK.",".KGGEWGGGGEWGGK.",".KGGGGGGGGGGGGK.","KGGGGGMMMMGGGGGK","KGGGGGGMMGGGGGGK",".KKGGGGGGGGGGKK.","...KKKKKKKKKK..."],{K:'#14321f',G:'#4ade80',L:'#dcfce7',E:'#0b0b10',W:'#ffffff',M:'#166534'}));
SP.monitor=gridCanvas(strGrid(["KKKKKKKKKKKK","KCCCCCCCCCCK","KCWCCCCCCCCK","KCCWCCCCCCCK","KCCCCCCCCCDK","KCCCCCCCCDDK","KCCCCCCCDDDK","KKKKKKKKKKKK",".....KK.....","....KGGK....","..KKKKKKKK..","............"],{K:'#0b0b10',C:'#7c3aed',W:'#ddd6fe',D:'#5b21b6',G:'#71717a'}));
SP.mug=gridCanvas(strGrid(["............","..W..W..W...","...W..W..W..","............",".KKKKKKKKK..",".KMMMMMMMKKK",".KMMMMMMMK.K",".KMWMMMMMK.K",".KMMMMMMMKKK",".KMMMMMMMK..","..KKKKKKK...","............"],{K:'#1c1917',M:'#fb923c',W:'#d4d4d8'}));
SP.book=gridCanvas(strGrid([".KKKKKKKKK..",".KRRRRRRRKK.",".KRWWWWWRKWK",".KRRRRRRRKWK",".KRWWWRRRKWK",".KRRRRRRRKWK",".KRRRRRRRKWK",".KRRRRRRRKWK",".KRRRRRRRKWK",".KKKKKKKKKWK","..KWWWWWWWWK","...KKKKKKKK."],{K:'#1c1917',R:'#b91c1c',W:'#fef3c7'}));
SP.pad=gridCanvas(strGrid(["............","............","..KKKKKKKK..",".KGGGGGGGGK.","KGGWGGGGRGGK","KGWWWGGRGRGK","KGGWGGGGRGGK","KGGGGKKGGGGK","KGGGK..KGGGK",".KKK....KKK.","............","............"],{K:'#0b0b10',G:'#52525b',W:'#e4e4e7',R:'#a855f7'}));
SP.house=gridCanvas(strGrid([".....KK.....","....KRRK....","...KRRRRK...","..KRRRRRRK..",".KRRRRRRRRK.","KKKKKKKKKKKK",".KWWWWWWWWK.",".KWYWWWWYWK.",".KWWWKKWWWK.",".KWWWKDKWWK.",".KWWWKKKWWK.",".KKKKKKKKKK."],{K:'#1c1528',R:'#a855f7',W:'#f4f4f5',Y:'#fde047',D:'#6d28d9'}));
const URL_={};
$$('img[data-spr]').forEach(im=>{const n=im.dataset.spr,c=SP[n];if(!c)return;URL_[n]=URL_[n]||c.toDataURL();const sc=+im.dataset.sc||4;im.src=URL_[n];im.width=c.width*sc;im.height=c.height*sc;im.alt=''});

/* ================= ICONS ================= */
const IC={bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',chev:'<path d="m6 9 6 6 6-6"/>',chevr:'<path d="m9 18 6-6-6-6"/>',
moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
log:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>',
scroll:'<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
sword:'<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/>',
check:'<path d="M20 6 9 17l-5-5"/>',home:'<path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',unlock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
arrow:'<path d="M5 12h14M13 5l7 7-7 7"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',undo:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
plus:'<path d="M5 12h14M12 5v14"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'};
const icon=(el,n)=>{el.innerHTML='<svg viewBox="0 0 24 24">'+(IC[n]||'')+'</svg>';el.dataset.cur=n};
$$('i[data-i]').forEach(el=>icon(el,el.dataset.i));

/* logo letters */
$$('[data-text]').forEach(h=>{let q=false;h.innerHTML=[...h.dataset.text].map(ch=>{if(ch===' '){q=true;return '<span class="sp"></span>'}return '<span'+(q?' class="q"':'')+'>'+ch+'</span>'}).join('')});

/* split S5 headline into per-char theme cells so the dark-mode ripple passes through text */
['#s5head h2','#s5head p'].forEach(sel=>{const root=$(sel);const walk=n=>{[...n.childNodes].forEach(ch=>{if(ch.nodeType===3){const f=document.createDocumentFragment();[...ch.textContent].forEach(x=>{const s=document.createElement('span');s.className='thm';s.textContent=x;f.appendChild(s)});ch.replaceWith(f)}else walk(ch)})};walk(root)});
/* ================= TRACK ENGINE ================= */
const DEF={o:1,x:0,y:0,s:1,r:0,b:0},TR=[],HK=[];
function K(sel,frames,opt={}){const els=typeof sel==='string'?$$(sel):[sel];
 els.forEach((el,i)=>{const off=(opt.st||0)*i;let cur={...DEF};const f=frames.map(([tt,p,e])=>{cur={...cur,...p};return[tt+off,cur,e||'out']});TR.push({el,f,vis:!!opt.vis})})}
function applyTracks(t){for(const {el,f,vis} of TR){let v;const n=f.length;
 if(t<=f[0][0])v=f[0][1];else if(t>=f[n-1][0])v=f[n-1][1];else{for(let i=0;i<n-1;i++){if(t<f[i+1][0]){const p=E[f[i+1][2]](clamp((t-f[i][0])/(f[i+1][0]-f[i][0])));const a=f[i][1],b=f[i+1][1];v={};for(const k in DEF)v[k]=a[k]+(b[k]-a[k])*p;break}}}
 el.style.opacity=v.o.toFixed(4);if(vis)el.style.visibility=v.o<=.002?'hidden':'visible';
 el.style.transform=`translate(${v.x.toFixed(2)}px,${v.y.toFixed(2)}px) scale(${v.s.toFixed(4)}) rotate(${v.r.toFixed(2)}deg)`;
 el.style.filter=v.b>.05?`blur(${v.b.toFixed(2)}px)`:'none'}}
const H=f=>HK.push(f);
const tog=(el,c,on)=>{if(el.classList.contains(c)!==!!on)el.classList.toggle(c,!!on)};
const txt=(el,s)=>{if(el.textContent!==s)el.textContent=s};
const press=(el,t,tc)=>{el.style.transform=`scale(${(1-.07*bump(t,tc-.03,.22)).toFixed(4)})`};
const alphaOf=el=>+el.style.opacity||0;

/* ---------- S1 ---------- */
K('#s1',[[0,{o:1}],[2.2,{o:1,s:1,b:0}],[2.6,{o:0,s:.94,b:10},'in']],{vis:1});
K('#s1hero',[[.08,{o:0,s:.3,y:60}],[.6,{o:1,s:1,y:0},'bk2']]);
K('#s1season',[[.35,{o:0,y:16}],[.75,{o:1,y:0}]]);
K('#s1logo span',[[.5,{o:0,y:70,b:14}],[1.05,{o:1,y:0,b:0},'expo']],{st:.04});
K('#s1sub',[[1.05,{o:0,y:24}],[1.5,{o:1,y:0},'expo']]);
K('#s1tag',[[1.3,{o:0,y:20}],[1.75,{o:1,y:0},'expo']]);
/* ---------- S2 ---------- */
K('#s2',[[2.35,{o:0}],[2.6,{o:1,x:0,b:0}],[5.85,{o:1,x:0,b:0}],[6.2,{o:0,x:-160,b:8},'in']],{vis:1});
K('#gnb',[[2.4,{o:0,y:-50}],[2.9,{o:1,y:0},'expo']]);
K('.b2c',[[2.55,{o:0,y:90,s:.94,b:12}],[3.25,{o:1,y:0,s:1,b:0},'expo']],{st:.14});
K('#s2 .rrow',[[3.0,{o:0,x:-30}],[3.45,{o:1,x:0},'expo']],{st:.07});
K('#s2 .dqi',[[3.2,{o:0,x:30}],[3.65,{o:1,x:0},'expo']],{st:.07});
K('#s2 .fit',[[3.45,{o:0,y:20}],[3.85,{o:1,y:0},'expo']],{st:.05});
K('#cap2',[[3.5,{o:0,y:30}],[3.95,{o:1,y:0},'expo']]);
/* ---------- S3 ---------- */
K('#s3',[[5.95,{o:0,x:200}],[6.35,{o:1,x:0},'expo'],[9.2,{o:1,b:0}],[9.5,{o:0,b:6}]],{vis:1});
K('.s3i',[[6.05,{o:0,y:40,b:8}],[6.6,{o:1,y:0,b:0},'expo']],{st:.08});
K('#qform',[[6.0,{o:0,y:70,s:.96}],[6.55,{o:1,y:0,s:1},'expo']]);
K('#qform .fr',[[6.2,{o:0,y:24}],[6.6,{o:1,y:0},'expo']],{st:.05});
/* ---------- HF1 ---------- */
K('#hf1',[[8.28,{o:0}],[8.4,{o:1}],[9.3,{o:1}],[9.5,{o:0}]],{vis:1});
K('#board',[[8.3,{o:0,y:40,s:.9}],[8.55,{o:1,y:0,s:1},'back']]);
K('#hf1char',[[8.3,{o:0,x:-220}],[8.52,{o:1,x:0},'expo'],[8.6,{y:0,r:0}],[8.68,{y:-46,r:-6},'out'],[8.8,{y:0,r:0},'in']]);
K('#hf1scroll',[[8.58,{o:0,x:-560,y:90,s:.35,r:-220}],[8.88,{o:1,x:0,y:0,s:1,r:0},'out'],[8.93,{s:1.14}],[9.02,{s:1},'out']]);
K('#flash1',[[8.86,{o:0,s:.2}],[8.95,{o:1,s:1}],[9.28,{o:0,s:1.4},'out']]);
K('#rays1',[[8.86,{o:0,s:.4,r:0}],[9.0,{o:1,s:1,r:8}],[9.5,{o:.8,s:1.1,r:30},'lin']]);
K('#hf1t',[[8.38,{o:0,y:-30,s:1.25}],[8.64,{o:1,y:0,s:1},'back']]);
K('#hf1s',[[8.7,{o:0,y:20}],[8.95,{o:1,y:0},'expo']]);
/* ---------- S4 ---------- */
K('#s4',[[9.25,{o:0,y:50}],[9.7,{o:1,y:0},'expo'],[13.2,{o:1}],[13.4,{o:0}]],{vis:1});
K('.s4i',[[9.3,{o:0,y:30}],[9.8,{o:1,y:0},'expo']],{st:.08});
K('#steps .step',[[9.38,{o:0,y:20}],[9.8,{o:1,y:0},'expo']],{st:.04});
K('.s4p',[[9.38,{o:0,y:60,b:8}],[9.95,{o:1,y:0,b:0},'expo']],{st:.09});
K('#m1',[[10.42,{o:0,y:16,s:.96}],[10.6,{o:1,y:0,s:1},'expo']]);
K('#m2',[[11.0,{o:0,y:16,s:.96}],[11.18,{o:1,y:0,s:1},'expo']]);
K('#typing',[[10.58,{o:0,y:8}],[10.68,{o:1,y:0}],[10.95,{o:1}],[11.02,{o:0}]]);
K('#reason',[[11.28,{o:0,y:-10}],[11.45,{o:1,y:0},'expo']]);
/* ---------- HF2 ---------- */
K('#hf2',[[11.82,{o:0}],[11.95,{o:1}],[13.3,{o:1}],[13.5,{o:0}]],{vis:1});
K('#slime',[[11.9,{o:0,s:.3,y:40}],[12.15,{o:1,s:1,y:0},'back'],[12.46,{x:0}],[12.5,{x:16}],[12.54,{x:-16}],[12.58,{x:10,s:1}],[12.62,{x:0,s:1.18,o:1}],[12.72,{s:.2,o:0},'in']]);
K('#hf2char',[[11.9,{o:0,x:-240}],[12.15,{o:1,x:0},'expo'],[12.24,{x:-36,r:0}],[12.4,{x:470,r:-10},'expo'],[12.5,{r:10}],[12.66,{r:0}],[12.9,{x:470}],[13.15,{x:396},'io']]);
K('#flash2',[[12.42,{o:0,s:.3}],[12.5,{o:1,s:1}],[12.82,{o:0,s:1.5}]]);
K('#dmg',[[12.45,{o:0,s:2.2,y:20}],[12.58,{o:1,s:1,y:0}],[12.95,{o:1,y:-30}],[13.1,{o:0,y:-50}]]);
K('#rays2',[[12.6,{o:0,s:.4,r:0}],[12.75,{o:1,s:1,r:5}],[13.5,{o:.7,s:1.1,r:30},'lin']]);
K('#lvup',[[12.85,{o:0,s:.4}],[13.08,{o:1,s:1},'bk2']]);
K('#hf2 .rwc',[[12.7,{o:0,y:50,s:.8}],[12.95,{o:1,y:0,s:1},'back']],{st:.08});
K('#hf2s',[[12.95,{o:0,y:16}],[13.15,{o:1,y:0}]]);
/* ---------- S5 ---------- */
K('#s5',[[13.3,{o:0}],[13.45,{o:1,s:1,b:0}],[15.85,{o:1,s:1,b:0}],[16.1,{o:0,s:.97,b:8},'in']],{vis:1});
K('#s5head',[[13.32,{o:0,y:30}],[13.8,{o:1,y:0},'expo']]);
K('#tgl',[[13.4,{o:0,y:-20}],[13.85,{o:1,y:0},'expo']]);
K('.tier',[[13.36,{o:0,y:80,s:.9,b:10}],[13.9,{o:1,y:0,s:1,b:0},'expo']],{st:.07});
K('#tline',[[13.6,{o:0}],[13.9,{o:1}]]);K('.tdots',[[13.6,{o:0}],[13.9,{o:1}]]);
/* ---------- S6 ---------- */
K('#s6',[[15.95,{o:0,x:160}],[16.35,{o:1,x:0},'expo'],[18.35,{o:1,s:1}],[18.6,{o:0,s:.97}]],{vis:1});
K('.s6s',[[16.0,{o:0,x:-40}],[16.4,{o:1,x:0},'expo']]);
K('.s6v',[[16.1,{o:0,x:-20}],[16.4,{o:1,x:0},'expo']],{st:.035});
K('.s6h',[[16.05,{o:0,y:24}],[16.45,{o:1,y:0},'expo']],{st:.06});
K('.s6c',[[16.12,{o:0,y:60,s:.95}],[16.6,{o:1,y:0,s:1},'expo']],{st:.07});
K('.s6b',[[16.3,{o:0,y:50}],[16.75,{o:1,y:0},'expo']],{st:.1});
K('#ledger',[[18.05,{o:0,y:10}],[18.2,{o:1,y:0}]]);
K('#plab',[[17.42,{o:0}],[17.52,{o:1}]]);
/* ---------- S7 ---------- */
K('#s7',[[18.45,{o:0}],[18.65,{o:1}]],{vis:1});
K('#s7hero',[[18.55,{o:0,s:.3,y:50}],[18.95,{o:1,s:1,y:0},'bk2']]);
K('#s7logo span',[[18.65,{o:0,y:60,b:12}],[19.15,{o:1,y:0,b:0},'expo']],{st:.035});
K('#s7sub',[[18.95,{o:0,y:20}],[19.35,{o:1,y:0},'expo']]);
K('#otag',[[19.1,{o:0,y:24}],[19.5,{o:1,y:0},'expo']]);
K('.ochip',[[19.25,{o:0,y:20}],[19.6,{o:1,y:0},'expo']],{st:.05});
K('#endc',[[20,{o:0,y:20}],[20.01,{o:0,y:20}]],{vis:1});

/* ================= HOOKS ================= */
const bobs=$$('img.bob');
H(t=>{bobs.forEach((im,i)=>{im.style.transform=`translateY(${Math.round(Math.sin(t*4.4+i*1.3)*1.6)*4}px)`});
 $('#blobA').style.transform=`translate(${-200+Math.sin(t*.4)*120}px,${-300+Math.cos(t*.3)*80}px)`;
 $('#blobB').style.transform=`translate(${1100+Math.cos(t*.35)*140}px,${380+Math.sin(t*.45)*90}px)`;});
// S2
const tabs=$$('#tabs .tab'),tabpill=$('#tabpill');
const timerEl=$('#timer');
H(t=>{
 const rem=7200-Math.floor(clamp(t-2.6,0,99)),hh=String(Math.floor(rem/3600)).padStart(2,'0'),mm=String(Math.floor(rem%3600/60)).padStart(2,'0'),ss=String(rem%60).padStart(2,'0');
 const s=`${hh}:${mm}:${ss}`;if(timerEl.dataset.v!==s){timerEl.dataset.v=s;timerEl.innerHTML=[...s].map(c=>c===':'?':':'<span class="dg">'+c+'</span>').join('')}
 const p=pr(t,3.0,4.0);txt($('#ptsN'),fmt(1500*p));txt($('#qN'),fmt(23*p));
 const pe=pr(t,3.1,4.0,'io');$('#expBar').style.width=(68*pe)+'%';txt($('#expN'),fmt(680*pe));
 $('#sbar').style.width=(78*pr(t,3.2,4.0,'io'))+'%';txt($('#dd'),String(Math.round(lerp(30,14,pr(t,3.0,3.8)))));
 const pg=pr(t,3.3,4.1,'io');$('#ringC').setAttribute('stroke-dashoffset',(194.8*(1-.75*pg)).toFixed(2));txt($('#ringT'),Math.round(3*pg)+'/4');
 $$('.dqb').forEach((b,i)=>{const w=[100,100,50,100][i]*pr(t,3.35+i*.1,3.95+i*.1,'io');b.style.width=w+'%';tog(b.closest('.dqi'),'ok',w>=99.5)});
 const tp=pr(t,5.62,5.9,'io'),a=TP[0],b=TP[1];tabpill.style.left=lerp(a.l,b.l,tp)+'px';tabpill.style.width=lerp(a.w,b.w,tp)+'px';
 tog(tabs[0],'on',tp<.5);tog(tabs[1],'on',tp>=.5);press($('#tabQ'),t,5.6);
});
// S3
const QT='3분기 원가 분석 엑셀 매크로 요청';
H(t=>{
 const sp=pr(t,6.55,6.75,'io');$('#segp').style.left=(5+170*sp)+'px';tog($('#segA'),'on',sp<.5);tog($('#segB'),'on',sp>=.5);
 txt($('#seghint'),sp>=.5?'결과물 제출이 필요한 업무 요청':'답변만 필요한 간단한 질문');press($('#segB'),t,6.55);
 const n=Math.floor(QT.length*pr(t,6.75,7.3,'lin'));txt($('#qtitle'),QT.slice(0,n));
 tog($('#qinp'),'focus',t>6.7&&t<7.32);$('#caret').style.opacity=(t>6.7&&t<7.32)?((t<7.3)?1:((t*3|0)%2)):0;
 const kp=.3*pr(t,7.3,7.75,'io');$('#knob').style.left=(kp*100)+'%';$('#tfill').style.width=(kp*100)+'%';
 const bv=Math.round(kp*1000/10)*10;txt($('#bv'),fmt(bv));txt($('#esB'),fmt(1500-bv)+' P');
 $('#knob').style.transform=`scale(${1+.18*clamp((t-7.27)/.08)*(t<7.8?1:0)})`;
 const up=pr(t,7.5,7.9,'io'),ok=pr(t,7.92,8.08);$('#spbar').style.width=(up*100)+'%';txt($('#sppct'),Math.round(up*100)+'%');
 $('#spup').style.opacity=(t<7.5?.55:1)*(1-ok);
 $('#spok').style.opacity=ok;$('#spok').style.transform=`translateY(${(1-ok)*14}px)`;
 txt($('#spstate'),t<7.5?'업로드 대기':t<7.92?'업로드 중…':'SharePoint 링크로 자동 변환됨');
 tog($('#cbx'),'on',t>=8.0);$('#cbx').style.transform=`scale(${1+.25*bump(t,8.0,.2)})`;press($('#qsubmit'),t,8.2);
});
// HF2 misc
H(t=>{$('#hp').style.width=(100*(1-pr(t,12.45,12.6)))+'%';const im=$('#slime img');const w=Math.sin(t*9);im.style.transform=`scale(${1+.04*w},${1-.04*w})`;im.style.transformOrigin='50% 100%';
 txt($('#dmg'),t<12.62?'CRITICAL!':'-9,999')});
// S4
const ST=[9.85,10.0,10.22,10.42,11.05,11.28,11.78],steps=$$('#steps .step');
H(t=>{let k=-1;ST.forEach((s,i)=>{if(t>=s)k=i});steps.forEach((el,i)=>{tog(el,'on',i<=k);tog(el,'cur',i===k)});
 let w=0;for(let i=1;i<ST.length;i++)w+=pr(t,ST[i]-.2,ST[i],'io');$('#sfill').style.width=(w/6*100)+'%';
 steps.forEach((el,i)=>{el.querySelector('.n').style.transform=`scale(${1+.18*bump(t,ST[i],.25)})`});
 const ad=t>=10.22;tog($('#ap1'),'sel',ad);tog($('#ap2'),'dim',ad);tog($('#ap3'),'dim',ad);txt($('#adopt'),ad?'채택 완료':'채택하기');press($('#adopt'),t,10.22);
 const lo=t>=10.42,li=$('#lock i');tog($('#lock'),'open',lo);if(li.dataset.cur!==(lo?'unlock':'lock'))icon(li,lo?'unlock':'lock');txt($('#lockT'),lo?'결과물 에디터 열림':'채택 전 에디터 잠금');
 press($('#snd'),t,10.42);
 $$('#typing .dots i').forEach((d,i)=>{d.style.transform=`translateY(${-Math.max(0,Math.sin(t*14-i*.9))*5}px)`});
 const sub=t>=11.05;$('#subc').style.opacity=sub?1:.38;$('#subc').style.transform=`scale(${1+.03*bump(t,11.05,.25)})`;
 const v2=t>=11.5;txt($('#vtag'),!sub?'제출 대기':v2?'v2 재제출':'v1 제출');txt($('#fname'),v2?'Q3_원가분석_자동화_v2.xlsx':'Q3_원가분석_자동화_v1.xlsx');
 const rs=$('#revst');txt(rs,t>=11.78?'완료':v2?'재제출 · 검수 대기':t>=11.28?'진행중 (보완요청)':sub?'검수 대기':'진행중');
 tog(rs,'solid',t>=11.78);tog(rs,'wait',t>=11.28&&!v2);
 press($('#rejB'),t,11.25);press($('#appB'),t,11.75);
});
// S5
const tierEls=$$('.tier'),tierImgs=tierEls.map(e=>e.querySelector('img')),tdots=$$('.tdots i'),thm=$$('#s5 .thm');
const EV=i=>13.95+i*.26;
H(t=>{
 tierImgs.forEach((im,i)=>{const b=bump(t,EV(i),.32);im.style.transform=`scale(${(1+.16*b).toFixed(3)})`;im.style.filter=b>.01?`brightness(${(1+1.4*b).toFixed(2)})`:'none';
  tog(tierEls[i],'hl',t>=EV(i)&&t<EV(i)+.5);tog(tdots[i],'on',t>=EV(i))});
 $('#tfill2').style.width=(100*pr(t,13.95,EV(5),'lin'))+'%';
 const sw=pr(t,14.55,14.75,'io');$('#swk').style.transform=`translateX(${34*sw}px)`;press($('#tgl'),t,14.55);
 const swi=$('#swi');if(swi.dataset.cur!==(sw>.5?'moon':'sun'))icon(swi,sw>.5?'moon':'sun');txt($('#tglT'),sw>.5?'게이밍 모드':'라이트 모드');
 const R=t>=15.05?99999:2400*pr(t,14.58,15.05,'io');const wp=$('#wipe');
 wp.style.visibility=(t>=14.58&&t<15.05)?'visible':'hidden';wp.style.clipPath=`circle(${R.toFixed(1)}px at ${TG.x}px ${TG.y}px)`;
 thm.forEach((el,i)=>tog(el,'dk',R>THD[i]));
 tog(stage,'dark',t>=15.05);
});
// S6
H(t=>{
 const lk=t>=16.62;tog($('#hrt'),'liked',lk);txt($('#hrtN'),lk?'25':'24');$('#hrt').style.transform=`scale(${1+.5*bump(t,16.62,.25)})`;txt($('#vwN'),t>=16.5?'133':'132');
 const q='이퀘스트',n=Math.floor(q.length*pr(t,16.5,16.74,'lin'));txt($('#orgq'),q.slice(0,n));$('#caret2').style.opacity=t<16.8?1:0;
 tog($('#orgHit'),'hit',t>=16.76);const dz=t>=16.9;txt($('#desig'),dz?'예약자 지정됨':'예약자 지정');press($('#desig'),t,16.9);
 const st=$('#pc1st');const done=t>=18.05;txt(st,done?'거래완료':dz?'예약중':'거래가능');tog(st,'ok',!dz);tog(st,'wait',dz&&!done);tog(st,'done',done);
 st.style.transform=`scale(${1+.25*(bump(t,16.9,.25)+bump(t,18.05,.25))})`;
 const b=$('#buy1');txt(b,done?'거래가 완료된 상품이에요':t>=17.22?'구매 요청 완료 · 판매자 승인 대기':dz?'샀어요 · 지정 예약자 전용':'샀어요 · 구매 요청');tog(b,'dis',done);press(b,t,17.22);
 const s=$('#setst');txt(s,done?'거래완료 · 정산 끝':t>=17.45?'판매자 거래 승인':t>=17.22?'판매자 승인 대기':'구매 요청 대기');tog(s,'ok',t>=17.45);tog(s,'g',t<17.45);
 const pp=pr(t,17.55,18.05,'io');txt($('#buyN'),fmt(700-500*pp));txt($('#selN'),fmt(1200+500*pp));
 txt($('#buyD'),t>=17.55?'−500 P':'');txt($('#selD'),t>=18.0?'+500 P':'');
 $('#ppB').style.transform=`scale(${1+.05*bump(t,18.0,.25)})`;$('#ppA').style.transform=`scale(${1-.04*bump(t,17.55,.25)})`;
});
// endcard
H(t=>{const e=$('#endc'),v=t>=DUR-.001;e.style.visibility=v?'visible':'hidden';e.style.opacity=v?1:0;e.style.transform='none'});

/* ================= POSITIONS ================= */
let k=1;const TP=[],P={};let TG={x:0,y:0};const THD=[];
function pos(el,dx=0,dy=0){const r=el.getBoundingClientRect(),s=stage.getBoundingClientRect();return{x:(r.left-s.left+r.width/2)/k+dx,y:(r.top-s.top+r.height/2)/k+dy,w:r.width/k,h:r.height/k}}
function measure(){
 TP.length=0;tabs.slice(0,2).forEach(tb=>TP.push({l:tb.offsetLeft,w:tb.offsetWidth}));
 TG=pos($('#tgl .sw'));THD.length=0;thm.forEach(el=>{const p=pos(el);THD.push(Math.hypot(p.x-TG.x,p.y-TG.y))});
 ['#tabQ','#segB','#qinp','#cbx','#qsubmit','#adopt','#snd','#rejB','#appB','#desig','#buy1','#s1char','#s2char','#s7char','#ppA','#ppB'].forEach(s=>P[s]=pos($(s)));
 const tr=pos($('#trk'));P.k0={x:tr.x-tr.w/2,y:tr.y};P.k1={x:tr.x-tr.w/2+tr.w*.3,y:tr.y};
 P.tiers=tierImgs.map(im=>pos(im));P.qinpEnd={x:P['#qinp'].x+60,y:P['#qinp'].y+8};
 buildCursor();
}

/* ================= CURSOR ================= */
let CUR=[];
function buildCursor(){const g=(s,dx=0,dy=0)=>({x:P[s].x+dx,y:P[s].y+dy});
 CUR=[
  {a:4.9,b:5.95,k:[[4.9,{x:1560,y:1000}],[5.55,g('#tabQ',6,4)]],c:[5.6]},
  {a:6.3,b:8.32,k:[[6.3,{x:1700,y:1010}],[6.52,g('#segB',8,6)],[7.0,P.qinpEnd],[7.25,P.k0],[7.75,P.k1],[7.97,g('#cbx',4,4)],[8.17,g('#qsubmit',40,8)]],c:[6.55,7.27,8.0,8.2]},
  {a:9.95,b:11.9,k:[[9.95,{x:900,y:960}],[10.18,g('#adopt',8,6)],[10.38,g('#snd',4,4)],[11.2,g('#rejB',10,6)],[11.7,g('#appB',10,6)]],c:[10.22,10.42,11.25,11.75]},
  {a:14.1,b:15.15,k:[[14.1,{x:1300,y:760}],[14.5,{x:TG.x+10,y:TG.y+6}],[15.0,{x:1520,y:300}]],c:[14.55]},
  {a:16.5,b:17.55,k:[[16.5,{x:1300,y:1040}],[16.86,g('#desig',10,6)],[17.18,g('#buy1',30,6)],[17.5,g('#buy1',70,70)]],c:[16.9,17.22]}];
}
const cur=$('#cursor'),rip=$('#ripple');
function drawCursor(t){const sg=CUR.find(s=>t>=s.a&&t<=s.b);
 if(!sg){cur.style.visibility='hidden';rip.style.visibility='hidden';return}
 let p=sg.k[0][1];const kk=sg.k;if(t>=kk[kk.length-1][0])p=kk[kk.length-1][1];else for(let i=0;i<kk.length-1;i++){if(t>=kk[i][0]&&t<kk[i+1][0]){const e=E.io((t-kk[i][0])/(kk[i+1][0]-kk[i][0]));p={x:lerp(kk[i][1].x,kk[i+1][1].x,e),y:lerp(kk[i][1].y,kk[i+1][1].y,e)};break}}
 const al=Math.min(clamp((t-sg.a)/.15),clamp((sg.b-t)/.15));let ps=1;
 cur.style.visibility='visible';cur.style.opacity=al;
 let rc=null;sg.c.forEach(c=>{if(t>=c&&t<c+.45)rc=c;ps-=.16*bump(t,c-.04,.16)});
 cur.style.transform=`translate(${p.x-8}px,${p.y-4}px) scale(${ps})`;
 if(rc!==null){const q=(t-rc)/.45;rip.style.visibility='visible';rip.style.left=p.x+'px';rip.style.top=p.y+'px';rip.style.opacity=(1-q)*al;rip.style.transform=`scale(${.3+1.1*E.out(q)})`}else rip.style.visibility='hidden';
}

/* ================= FX CANVAS ================= */
const cv=$('#fx'),ctx=cv.getContext('2d');
function spr(n,x,y,sc,al=1,fx=1){const c=SP[n],w=c.width*sc,h=c.height*sc;ctx.globalAlpha=clamp(al);ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(fx,1);ctx.drawImage(c,-w/2,-h/2,w,h);ctx.restore()}
function sq(col,x,y,s,al){ctx.globalAlpha=clamp(al);ctx.fillStyle=col;ctx.fillRect(Math.round(x/2)*2-s/2,Math.round(y/2)*2-s/2,s,s)}
function burst(t,t0,o){const d0=t-t0;if(d0<0||d0>o.life)return;const R=rng(o.seed);
 for(let i=0;i<o.n;i++){const a=(o.ang??-Math.PI/2)+(R()-.5)*(o.spread??Math.PI*2),v=o.sp*(.35+R()*.9),sc=o.sc*(.6+R()*.7),pick=o.spr[Math.floor(R()*o.spr.length)],dl=R()*(o.jit||0),ph=R()*6;
  const d=d0-dl;if(d<0)continue;const dr=o.drag||0,f=dr?(1-Math.exp(-dr*d))/dr:d;
  const x=o.x+Math.cos(a)*v*f,y=o.y+Math.sin(a)*v*f+.5*(o.g||0)*d*d,al=(1-Math.pow(d/(o.life-dl),3))*(o.al??1);
  if(pick[0]==='#')sq(pick,x,y,Math.round(sc),al);else spr(pick,x,y,sc,al,o.spin?Math.cos(d*12+ph):1)}}
function rain(t,t0,t1,o){if(t<t0||t>t1+1.5)return;const R=rng(o.seed);
 for(let i=0;i<o.n;i++){const st=t0+R()*(t1-t0),x=R()*1920,v=o.v*(.7+R()*.6),sc=o.sc*(.7+R()*.6),pick=o.spr[Math.floor(R()*o.spr.length)],ph=R()*6;const d=t-st;if(d<0)continue;
  const y=-40+v*d+450*d*d;if(y>1140)continue;spr(pick,x,y,sc,(o.al??1)*clamp((t1+.3-t)/.3+1),Math.cos(d*10+ph))}}
function aura(t,t0,cx,cy,w,h,cols,seed,n,al){if(t<t0)return;const R=rng(seed),fi=clamp((t-t0)/.3)*al;if(fi<=0)return;
 for(let i=0;i<n;i++){const per=.9+R()*.9,ph=((t-t0)/per+R())%1,x=cx+(R()-.5)*w,y=cy+h*.45-ph*h,s=[6,8,10][Math.floor(R()*3)],c=cols[Math.floor(R()*cols.length)];sq(c,x+Math.sin(ph*6+i)*6,y,s,Math.sin(ph*Math.PI)*fi)}}
function bolts(t,cx,cy,r,al,n=3){if(al<=0)return;const fr=Math.floor(t*16);ctx.save();ctx.lineJoin='miter';
 for(let b=0;b<n;b++){const R=rng(fr*31+b*977),a=R()*Math.PI*2;if(R()<.25)continue;let x=cx+Math.cos(a)*r*.55,y=cy+Math.sin(a)*r*.55;const pts=[[x,y]];
  for(let s=0;s<6;s++){const aa=a+(R()-.5)*1.1,st=r*.11;x+=Math.cos(aa)*st+(R()-.5)*14;y+=Math.sin(aa)*st+(R()-.5)*14;pts.push([x,y])}
  [[10,'rgba(168,85,247,.35)'],[4,'#c084fc'],[1.6,'#faf5ff']].forEach(([lw,c])=>{ctx.globalAlpha=al*(.6+R()*.4);ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();pts.forEach(([px,py],j)=>j?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.stroke()})}
 ctx.restore()}
function slash(t,t0,cx,cy,r){const d=(t-t0)/.22;if(d<0||d>2.6)return;const a0=-2.5,sw=3.6,head=a0+sw*E.out(clamp(d)),fade=clamp(1-(d-1)/1.6);
 ctx.save();ctx.lineCap='round';
 for(let i=0;i<26;i++){const f0=i/26,f1=(i+1)/26,len=1.7,s0=Math.max(a0,head-len+len*f0),s1=Math.max(a0,head-len+len*f1);if(s1<=s0)continue;
  ctx.globalAlpha=fade*(.15+.85*f1);ctx.strokeStyle='#a855f7';ctx.lineWidth=6+46*f1;ctx.shadowColor='#a855f7';ctx.shadowBlur=30;ctx.beginPath();ctx.arc(cx,cy,r,s0,s1);ctx.stroke();
  ctx.shadowBlur=0;ctx.strokeStyle='#f5f3ff';ctx.lineWidth=2+14*f1;ctx.beginPath();ctx.arc(cx,cy,r,s0,s1);ctx.stroke()}
 ctx.restore()}
function twinkle(t,t0,t1,x0,y0,w,h,seed,n,al){if(t<t0||t>t1)return;const R=rng(seed);for(let i=0;i<n;i++){const x=x0+R()*w,y=y0+R()*h,ph=R()*6,sp=3+R()*3,s=1+R()*2.2;const v=Math.max(0,Math.sin(t*sp+ph));spr('star',x,y,Math.round(s*2)/2+.5,v*al)}}
const SA=id=>alphaOf(document.getElementById(id));
function drawFx(t){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,1920,1080);ctx.imageSmoothingEnabled=false;
 // S1
 const a1=SA('s1');if(a1>0){const c=P['#s1char'];burst(t,.5,{x:c.x,y:c.y,n:30,seed:7,spr:['coin','coin','star','gem'],sc:4,sp:900,g:1500,life:1.7,spread:2.6,drag:1.2,spin:1,al:a1});
  twinkle(t,.9,2.6,360,430,1200,420,11,14,a1*pr(t,.9,1.3))}
 // S2 aura
 const a2=SA('s2');if(a2>0){const c=P['#s2char'];aura(t,2.9,c.x,c.y+10,300,320,['#fbbf24','#fde68a','#f59e0b'],21,18,a2);twinkle(t,3,6.2,c.x-200,c.y-200,400,360,23,5,a2*.9)}
 // HF1
 const h1=SA('hf1');if(h1>0){burst(t,8.9,{x:1280,y:540,n:34,seed:31,spr:['star','star','coin','#c084fc','#fde047'],sc:5,sp:1100,g:600,life:1.1,drag:2.5,spin:1,al:h1});
  burst(t,8.6,{x:690,y:560,n:10,seed:33,spr:['#c084fc','#e9d5ff'],sc:10,sp:300,g:0,life:.6,drag:3,al:h1})}
 // HF2
 const h2=SA('hf2');if(h2>0){slash(t,12.36,1240,680,250);
  burst(t,12.64,{x:1240,y:690,n:46,seed:41,spr:['#4ade80','#22c55e','#dcfce7','#166534'],sc:14,sp:1100,g:1600,life:1.2,drag:1.5,al:h2});
  burst(t,12.66,{x:1240,y:660,n:36,seed:43,spr:['coin','coin','coin','gem','gem','star'],sc:6,sp:1400,g:1900,life:1.4,spread:2.4,drag:.8,spin:1,al:h2});
  rain(t,12.7,13.35,{n:46,seed:47,spr:['coin','coin','gem','star'],sc:5,v:500,al:h2});
  const cp=SA('hf2');aura(t,12.9,960,640,420,360,['#e9d5ff','#c084fc','#fde047'],49,16,cp*pr(t,12.9,13.1))}
 // S5
 const a5=SA('s5');if(a5>0){const cols=[['#cd7f32','#f0b27a'],['#e2e8f0','#94a3b8'],['#fbbf24','#fde68a'],['#67e8f9','#e2e8f0','#a5f3fc'],['#22d3ee','#f0fdff','#a5f3fc'],['#c084fc','#f0abfc','#a855f7']];
  P.tiers.forEach((c,i)=>{aura(t,EV(i),c.x,c.y,190,220,cols[i],60+i,i>=3?16:9,a5);burst(t,EV(i),{x:c.x,y:c.y,n:14,seed:70+i,spr:['star',cols[i][0]],sc:4,sp:520,g:300,life:.7,drag:3,al:a5})});
  const m=P.tiers[5];bolts(t,m.x,m.y,200,a5*pr(t,EV(5),EV(5)+.2)*(t>=15.05?1:.55),3)}
 // S6 coins
 const a6=SA('s6');if(a6>0){const A=P['#ppA'],B=P['#ppB'];for(let i=0;i<10;i++){const s=17.5+i*.05,p=pr(t,s,s+.45,'io');if(p<=0||p>=1)continue;spr('coin',lerp(A.x+110,B.x-110,p),lerp(A.y,B.y,p)-Math.sin(p*Math.PI)*110,4,a6,Math.cos(t*14+i))}
  burst(t,18.02,{x:B.x,y:B.y-30,n:16,seed:91,spr:['star','coin','#4ade80'],sc:4,sp:520,g:900,life:.8,drag:2,al:a6})}
 // S7
 const a7=SA('s7');if(a7>0){const c=P['#s7char'];bolts(t,c.x,c.y,190,a7*pr(t,18.8,19),3);aura(t,18.8,c.x,c.y,260,280,['#c084fc','#f0abfc','#a855f7'],101,16,a7);
  burst(t,18.75,{x:c.x,y:c.y,n:34,seed:103,spr:['coin','coin','gem','star'],sc:5,sp:1000,g:1500,life:1.6,spread:2.8,drag:1,spin:1,al:a7});
  twinkle(t,19,99,260,300,1400,560,107,16,a7*pr(t,19,19.5))}
 ctx.globalAlpha=1}

/* ================= LOOP ================= */
let T=0,playing=false,w0=0;const prog=$('#progf');
function render(t){applyTracks(t);HK.forEach(h=>h(t));drawCursor(t);drawFx(t);prog.style.width=(t/DUR*100).toFixed(3)+'%'}
function fit(){k=Math.min(innerWidth/1920,innerHeight/1080);stage.style.setProperty('--k',k)}
function play(from=0){w0=performance.now()-from*1000;playing=true}
function loop(now){if(playing){T=(now-w0)/1000;if(T>=DUR){T=DUR;playing=false}render(T)}requestAnimationFrame(loop)}
addEventListener('resize',fit);
addEventListener('keydown',e=>{if(e.key==='r'||e.key==='R'){play(0)}else if(e.code==='Space'){e.preventDefault();if(playing){playing=false}else{play(T>=DUR?0:T)}}});
$('#rbtn').addEventListener('click',()=>play(0));$('#endb').addEventListener('click',()=>play(0));
window.__seek=t=>{playing=false;T=t;render(t)};window.__dur=DUR;
fit();
const fontsReady=Promise.race([document.fonts.ready.then(()=>Promise.all(['400','600','800','900'].map(w=>document.fonts.load(w+' 40px Paperlogy','오피스퀘스트A1')))),new Promise(r=>setTimeout(r,3500))]);
window.__ready=fontsReady.then(()=>{measure();const q=new URLSearchParams(location.search);
 if(q.has('t')){window.__seek(+q.get('t'))}else{render(0);play(0)}requestAnimationFrame(loop);return true});
})();
