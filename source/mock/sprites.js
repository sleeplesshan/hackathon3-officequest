(()=>{'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
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
for(let i=0;i<6;i++)SP['head'+i]=gridCanvas(crop(charGrid(i),4,4,16,14));
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

SP.keyboard=gridCanvas(strGrid(["............","............","............","KKKKKKKKKKKK","KWGWGWGWGWGK","KGWGWGWGWGWK","KWGWGWGWGWGK","KGGWWWWWWGGK","KKKKKKKKKKKK","............","............","............"],{K:'#0b0b10',W:'#e4e4e7',G:'#7c3aed'}));
SP.vest=gridCanvas(strGrid(["...K....K...","..KVK..KVK..",".KVVVKKVVVK.","KVVVVVVVVVVK","KVVLVVVVLVVK","KVVVVKKVVVVK","KVVLVKKVLVVK","KVVVVKKVVVVK","KVVVVKKVVVVK","KVVVVKKVVVVK","KKKKKKKKKKKK","............"],{K:'#0f172a',V:'#1e40af',L:'#93c5fd'}));
SP.ticket=gridCanvas(strGrid(["............","............","KKKKKKKKKKKK","KTTTTKTTTTTK","KTWWTKTTWTTK",".KTTT.TTTTK.",".KTTTKTTWTK.","KTWWTKTTTTTK","KTTTTKTTTTTK","KKKKKKKKKKKK","............","............"],{K:'#4c0519',T:'#f43f5e',W:'#fff1f2'}));
SP.chair=gridCanvas(strGrid(["..KKKKKKKK..","..KGGGGGGK..","..KGLGGGGK..","..KGGGGGGK..","KKKKKKKKKKKK","KGGGGGGGGGGK","KKKKKKKKKKKK","..K......K..","...K....K...","....K..K....","...K.KK.K...","..K......K.."],{K:'#052e16',G:'#16a34a',L:'#86efac'}));
window.SP=SP;window.rng=rng;window.clamp=clamp;
const URL_={};
window.applySprites=()=>$$('img[data-spr]').forEach(im=>{const n=im.dataset.spr,c=SP[n];if(!c)return;URL_[n]=URL_[n]||c.toDataURL();const sc=+im.dataset.sc||4;im.src=URL_[n];im.width=c.width*sc;im.height=c.height*sc;im.alt=''});

/* ================= ICONS ================= */
const IC={zap:'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',layout:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',trash:'<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',min:'<path d="M5 12h14"/>',filter:'<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',clip:'<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',building:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',msg:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',table:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',bold:'<path d="M6 12h9a4 4 0 0 1 0 8H6V4h8a4 4 0 0 1 0 8"/>',align:'<path d="M21 6H3M15 12H3M17 18H3"/>',cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',dots:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',crown:'<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',sort:'<path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',sparkle:'<path d="M9.94 14.06 12 21l2.06-6.94L21 12l-6.94-2.06L12 3 9.94 9.94 3 12z"/>',bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',chev:'<path d="m6 9 6 6 6-6"/>',chevr:'<path d="m9 18 6-6-6-6"/>',
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
window.applyIcons=()=>$$('i[data-i]').forEach(el=>icon(el,el.dataset.i));

})();
