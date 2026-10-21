(()=>{
const S=(n,sc,st='')=>`<img class="px" data-spr="${n}" data-sc="${sc}"${st?` style="${st}"`:''}>`;
const I=n=>`<i data-i="${n}"></i>`;
const B=(t,c='',ic='')=>`<span class="badge ${c}">${ic?I(ic):''}${t}</span>`;
const dg=s=>[...s].map(c=>c===':'?':':`<span class="dg">${c}</span>`).join('');
const TIER=[['브론즈','t-br'],['실버','t-si'],['골드','t-go'],['플래티넘','t-pl'],['다이아','t-di'],['마스터','t-ms']];
const tb=(t,lv,s='s')=>`<span class="badge ${s} ${TIER[t][1]}">${TIER[t][0]} Lv.${lv}</span>`;
const U={
 kim:{n:'김효성 대리',d:'재무팀',v:'마포마을',site:'마포 본사',t:2,lv:12,p:1500,id:'HS21034',h:'head2'},
 lee:{n:'이퀘스트 사원',d:'생산기술팀',v:'창원마을',site:'창원공장',t:1,lv:7,p:300,id:'HS24017',h:'head1'},
 park:{n:'박마스터 과장',d:'AI혁신팀',v:'반포마을',site:'반포',t:5,lv:28,p:5200,id:'HS15002',h:'head5'},
 choi:{n:'최다이아 차장',d:'IT혁신팀',v:'반포마을',site:'반포',t:4,lv:24,p:4870,id:'HS16011',h:'head4'},
 jung:{n:'정플래 대리',d:'인사팀',v:'수서마을',site:'수서',t:3,lv:19,p:2310,id:'HS19044',h:'head3'},
 oh:{n:'오신입 사원',d:'총무팀',v:'회현마을',site:'회현',t:0,lv:2,p:180,id:'HS26003',h:'head0'},
 han:{n:'한울산 과장',d:'생산기술팀',v:'울산마을',site:'울산공장',t:1,lv:6,p:1980,id:'HS17052',h:'head1'},
 kang:{n:'강창원 대리',d:'품질경영팀',v:'창원마을',site:'창원공장',t:1,lv:5,p:960,id:'HS22031',h:'head1'}};
const av=(u,sz=40,sc)=>{const x=U[u];const s=sc||(x.h.startsWith('head')?Math.floor(sz/16):Math.floor(sz/24));return `<div class="avt" style="width:${sz}px;height:${sz}px">${S(x.h,s)}</div>`};
const usr=(u,sz=40)=>{const x=U[u];return `<div class="usr">${av(u,sz)}<div><b>${x.n}</b><span>${x.d} · ${TIER[x.t][0]} Lv.${x.lv}</span></div></div>`};

function gnb(tab,per='kim',dark=false,pts=null){
 const tabs=[['대시보드','layout'],['업무 퀘스트','scroll'],['효성마을','home']];
 const pp=[['kim','김효성 대리'],['lee','이퀘스트 사원'],['park','박마스터 과장']];
 const p=pts??U[per].p;
 return `<header class="gnb"><div class="brand"><div class="lgt">${S('star',4)}</div>OFFICE QUEST<small>× 효성마을</small></div>
 <nav class="tabs">${tabs.map((t,i)=>`<span class="tab${i===tab?' on':''}">${I(t[1])}${t[0]}</span>`).join('')}</nav>
 <div class="gr">
  <div class="tmr"><span class="lv"></span><div><div class="l">시연 세션 남은 시간</div><b class="num">${dg('02:00:00')}</b></div><div class="tctl"><span class="z">${I('zap')}시연 타이머</span><span>+30분</span><span>만료 테스트</span><span>${I('undo')}</span></div></div>
  <div class="chip">${S('coin',3)}<span class="num">${p.toLocaleString('en-US')}</span><small>P</small></div>
  <div class="pers"><span class="lab">페르소나</span>${pp.map(([k,n])=>`<span class="p${k===per?' on':''}"><span class="av">${S(U[k].h,2)}</span>${k===per?n:''}</span>`).join('')}${I('chev')}</div>
  <div class="thm">${dark?'게이밍':'라이트'}<div class="sw"><i class="k">${I(dark?'moon':'sun')}</i></div></div>
 </div></header>`}
const bg=`<div class="bgfx"></div><div class="blob" style="left:-300px;top:-400px"></div><div class="blob" style="right:-400px;bottom:-500px"></div>`;
function sideQuest(on){const it=[['daily','gift','일일 퀘스트','1/4'],['create','plus','퀘스트 등록',''],['board','scroll','업무 퀘스트 게시판','7']];
 return `<aside class="card side"><h4>업무 퀘스트</h4>${it.map(x=>`<div class="nv${x[0]===on?' on':''}"><span class="t">${I(x[1])}</span>${x[2]}<em>${x[3]}</em></div>`).join('')}
 <h4>내 퀘스트</h4><div class="nv"><span class="t">${I('edit')}</span>내가 요청한 퀘스트<em>1</em></div><div class="nv"><span class="t">${I('send')}</span>내가 지원한 퀘스트<em>0</em></div><div class="nv"><span class="t">${I('check')}</span>완료 내역<em>23</em></div>
 <div class="sidebox"><div class="row gap8">${I('info')}<b>오늘 완료 보상 0 / 2</b></div><p>퀘스트 완료 보상(100P + 현상금, 100 EXP)은 작업자 기준 하루 2회까지 지급돼요.</p></div></aside>`}
const VIL=[['ALL','전체 마을 모아보기',8],['마','마포마을',2],['회','회현마을',1],['반','반포마을',1],['수','수서마을',1],['창','창원마을',1],['울','울산마을',2]];
function sideVillage(on=0){return `<aside class="card side"><div class="row gap10" style="padding:6px 8px 0">${S('house',3)}<b style="font-size:22px;font-weight:800;letter-spacing:-.03em">효성마을</b></div>
 <p class="mut" style="font-size:13px;font-weight:600;padding:4px 10px 14px">사내 포인트 중고거래 마켓</p>
 <span class="btn pri" style="width:100%">${I('plus')}중고물품 글 등록</span><h4>사업장별 마을</h4>
 ${VIL.map((v,i)=>`<div class="nv${i===on?' on':''}"><span class="t" style="font-size:12px;font-weight:800">${v[0]}</span>${v[1]}<em>${v[2]}</em></div>`).join('')}
 <div class="sidebox"><b>내 거래 현황</b><p>판매중 1 · 예약중 0 · 거래완료 0<br>구매 요청 0건 · 보유 300 P</p></div></aside>`}
/* ---------- seed ---------- */
const Q=[
 {no:7,ty:'요청',st:'모집중',t:'3분기 원가 분석 엑셀 매크로 요청',b:300,u:'kim',ap:3,vw:128,dt:'10.21',dl:'10/23(금)',sp:1},
 {no:6,ty:'문의',st:'모집중',t:'법인카드 해외결제 증빙 기준 문의',b:50,u:'lee',ap:1,vw:57,dt:'10.21',dl:'10/22(목)'},
 {no:5,ty:'요청',st:'진행중',t:'신입사원 온보딩 교육 PPT 디자인',b:500,u:'jung',ap:4,vw:211,dt:'10.20',dl:'10/27(화)',sp:1},
 {no:4,ty:'요청',st:'보완요청',t:'울산공장 설비 점검표 양식 자동화',b:400,u:'han',ap:2,vw:143,dt:'10.19',dl:'10/24(토)',sp:1},
 {no:3,ty:'문의',st:'모집중',t:'Power BI 대시보드 공유 권한 설정 문의',b:150,u:'kang',ap:0,vw:34,dt:'10.19',dl:'10/26(월)'},
 {no:2,ty:'문의',st:'완료',t:'SAP 전표 역분개 오류 해결 방법 문의',b:100,u:'oh',ap:2,vw:96,dt:'10.17',dl:'완료'},
 {no:1,ty:'요청',st:'완료',t:'사내 뉴스레터 10월호 원고 교정',b:200,u:'park',ap:5,vw:302,dt:'10.15',dl:'완료'}];
const stB=s=>({'모집중':B('모집중','s b-ok'),'진행중':B('진행중','s'),'보완요청':B('진행중 · 보완요청','s b-wait'),'완료':B('완료','s b-done')}[s]);
const tyB=t=>t==='문의'?B('문의','s b-info'):B('요청','s');
const M=[
 {t:'27인치 QHD 모니터',v:'마포마을',c:'디지털/가전',p:500,st:'거래가능',lk:24,vw:132,s:'monitor',u:'kim',tc:['#EDE9FE','#1B1630']},
 {t:'캡슐 커피머신 (캡슐 20개 포함)',v:'회현마을',c:'생활/주방',p:0,st:'예약중',lk:41,vw:208,s:'mug',u:'oh',tc:['#FFEDD5','#2A1A14']},
 {t:'경영 전략 도서 5권 세트',v:'울산마을',c:'도서/티켓/쿠폰',p:300,st:'예약중',lk:12,vw:87,s:'book',u:'han',tc:['#FEE2E2','#2A1418']},
 {t:'게임 패드 2개 세트',v:'창원마을',c:'취미/기타',p:1200,st:'거래가능',lk:33,vw:301,s:'pad',u:'lee',tc:['#F4F4F5','#1A1A22']},
 {t:'무선 기계식 키보드 (적축)',v:'반포마을',c:'디지털/가전',p:800,st:'거래가능',lk:19,vw:154,s:'keyboard',u:'choi',tc:['#EDE9FE','#17142A']},
 {t:'겨울 패딩 조끼 L 사이즈',v:'수서마을',c:'의류/잡화',p:0,st:'거래가능',lk:27,vw:176,s:'vest',u:'jung',tc:['#DBEAFE','#121A2C']},
 {t:'CGV 영화 예매권 2매',v:'마포마을',c:'도서/티켓/쿠폰',p:400,st:'거래가능',lk:36,vw:245,s:'ticket',u:'park',tc:['#FFE4E6','#2A1420']},
 {t:'캠핑 의자 2개 (접이식)',v:'울산마을',c:'취미/기타',p:600,st:'거래완료',lk:8,vw:92,s:'chair',u:'han',tc:['#DCFCE7','#122018']}];
const mkB=s=>({'거래가능':B('거래가능','s b-ok'),'예약중':B('예약중','s b-wait'),'거래완료':B('거래완료','s b-done')}[s]);
const price=p=>p?`<b class="num">${p.toLocaleString('en-US')} P</b>`:`<b class="free">무료나눔</b>`;

/* ================= PAGES ================= */
const P={};
P['01']=()=>gnb(0)+`<main class="shell"><div class="bento">
 <div class="card r2"><div class="ct"><h3>내 캐릭터 스테이터스</h3>${B('GOLD 티어','t-go')}</div>
  <div class="hero"><div class="floor"></div><span class="badge b-solid tl">Lv.12</span><span class="badge t-go tr">황금 갑옷 장착</span><span class="badge bl" style="background:var(--surface);box-shadow:var(--sh-seg)">${I('clock')}오늘 완료 보상 0 / 2</span>${S('char2',12,'margin-top:-36px')}</div>
  <div class="nm"><b>김효성 대리</b><span>재무팀 · 마포마을 · HS21034</span></div>
  <div class="exprow"><span>골드 <b>Lv.12</b> · 다음 레벨까지 32 EXP</span><span><b>68</b> / 100 EXP</span></div><div class="bar"><i style="width:68%"></i></div>
  <div class="stats"><div class="stat"><div class="k">보유 포인트</div><div class="v num">1,500<small>P</small></div></div><div class="stat"><div class="k">오늘 완료</div><div class="v num">0/2<small>회</small></div></div><div class="stat"><div class="k">완료 퀘스트</div><div class="v num">23<small>건</small></div></div></div></div>
 <div class="card r2"><div class="ct"><h3>시즌 랭킹 TOP 5</h3>${B('2026 Season 1')}</div>
  <div class="dday"><b>D-<em>14</em></b><div class="dt"><strong>시즌 종료까지 14일</strong>11월 4일 (수) 23:59 마감 · 진행률 78%<div class="sb"><i></i></div></div></div>
  <div style="display:flex;flex-direction:column;gap:4px;flex:1">
  ${[['park','2,740'],['choi','2,360'],['jung','1,850'],['kim','1,168'],['lee','650']].map(([u,s],i)=>`<div class="rrow${u==='kim'?' me':''}"><span class="no"${i===0?' style="color:#7C3AED"':''}>${i+1}</span>${av(u,50)}<div class="who"><b>${U[u].n}${u==='kim'?' <span class="badge s b-solid" style="height:20px;font-size:11px;padding:0 7px">나</span>':''}</b><span>${U[u].d} · </span>${tb(U[u].t,U[u].lv)}</div><div class="sc"><b class="num">${s}</b><span>시즌 EXP</span></div></div>`).join('')}</div>
  <div class="row gap10" style="margin-top:10px;padding-top:14px;border-top:1px solid var(--border)"><span class="btn sm">${I('undo')}시즌 초기화 시뮬레이션</span><span class="mut" style="font-size:12.5px;font-weight:600">전원 Lv.1 브론즈 · 0 EXP로 초기화 · 보유 P 100% 유지</span></div></div>
 <div class="card"><div class="ct"><div><h3>오늘의 일일 퀘스트</h3><div class="mut" style="font-size:13px;font-weight:600;margin-top:4px">달성 시 +10 P · +50 EXP · 매일 00:00 초기화</div></div>
  <div class="ring"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="29" stroke="var(--accent-soft)" stroke-width="8" fill="none"/><circle cx="36" cy="36" r="29" stroke="#7C3AED" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="182.2" stroke-dashoffset="136.7"/></svg><b>1/4</b></div></div>
  <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px;flex:1;justify-content:space-between">
  ${[['log','오늘 접속하기',100,'1/1',1],['scroll','퀘스트 등록',0,'0/1'],['sword','퀘스트 완료',0,'0/1'],['check','채택되기',0,'0/1']].map(d=>`<div class="dqi"><span class="ic-t${d[4]?' on':''}">${I(d[0])}</span><span class="n">${d[1]}</span><div class="bar"><i style="width:${d[2]}%"></i></div><span class="c">${d[3]}</span><span class="rw">${d[4]?'보상 받기 가능':'+10P +50EXP'}</span></div>`).join('')}</div></div>
 <div class="card"><div class="ct"><h3>최신 소식</h3><span class="mut" style="font-size:12.5px;font-weight:600">${I('sparkle')} 실시간 동기화 · 방금 전</span></div>
  <div class="feed"><div class="fcol"><h4>${I('scroll')}최신 업무 퀘스트</h4>
  ${Q.slice(0,3).map(q=>`<div class="fit"><div class="th">${S('scroll',4)}</div><div class="tx"><div class="row gap6">${tyB(q.ty)}${stB(q.st)}</div><b>${q.t}</b><span>100P + 현상금 ${q.b}P · ${U[q.u].d}</span></div></div>`).join('')}</div>
  <div class="fcol"><h4>${I('home')}효성마을 인기 매물</h4>
  ${[M[1],M[6],M[0]].map(m=>`<div class="fit"><div class="th">${S(m.s,3)}</div><div class="tx"><div class="row gap6">${mkB(m.st)}<span class="hrt row gap6" style="font-size:12px;font-weight:700">${I('heart')}${m.lk}</span></div><b>${m.t}</b><span>${m.v} · ${m.p?m.p.toLocaleString('en-US')+' P':'무료나눔'}</span></div></div>`).join('')}</div></div></div>
</div></main>`;

P['02']=()=>gnb(1)+`<main class="shell ws">${sideQuest('daily')}<div style="display:flex;flex-direction:column;gap:20px;min-height:0">
 <div class="ph"><div><div class="crumb">업무 퀘스트 ${I('chevr')} 일일 퀘스트</div><h1 style="margin-top:6px">일일 퀘스트</h1><p>매일 00:00에 초기화돼요 · 미션 1개 달성마다 +10 P · +50 EXP</p></div>
  <div class="row gap10"><div class="chip">${I('clock')}<span class="num">초기화까지 09:57:12</span></div><div class="chip" style="color:var(--accent)">${I('gift')}오늘 받은 보상 0 P · 0 EXP</div></div></div>
 <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">
 ${[['log','오늘 접속하기','오피스퀘스트에 로그인하면 자동 달성',1,1,'pri','보상 받기 +10 P'],['scroll','퀘스트 등록','문의 또는 요청 퀘스트 1건 등록',0,1,'','퀘스트 등록하러 가기'],['sword','퀘스트 완료','작업자로 퀘스트 1건 최종 승인받기',0,1,'','진행중 퀘스트 0건'],['check','채택되기','내가 지원한 퀘스트에 1회 채택되기',0,1,'','지원 중인 퀘스트 0건']].map(d=>`<div class="card pad" style="display:flex;flex-direction:column;gap:12px">
  <div class="row"><span class="ic-t${d[3]?' on':''}" style="width:46px;height:46px;font-size:21px;border-radius:13px">${I(d[0])}</span>${d[3]?B('달성 완료','s b-ok ml',''):B('진행중','s b-g ml')}</div>
  <div><b style="font-size:19px;font-weight:800">${d[1]}</b><div class="mut" style="font-size:13.5px;font-weight:600;margin-top:4px">${d[2]}</div></div>
  <div class="row gap10"><div class="bar" style="flex:1"><i style="width:${d[3]/d[4]*100}%"></i></div><b class="num" style="font-size:14px">${d[3]}/${d[4]}</b></div>
  <div class="row gap6">${B('+10 P','s')}${B('+50 EXP','s b-g')}</div>
  <span class="btn ${d[5]}${d[5]?'':' dis'}" style="width:100%">${d[5]?I('gift'):''}${d[6]}</span></div>`).join('')}</div>
 <div style="display:grid;grid-template-columns:420px 1fr;gap:20px;flex:1;min-height:0">
  <div class="card pad" style="display:flex;flex-direction:column"><div class="ct"><h3>내 캐릭터</h3>${B('GOLD','t-go')}</div>
   <div class="hero" style="margin:14px 0"><div class="floor"></div><span class="badge b-solid tl">Lv.12</span>${S('char2',10,'margin-top:-30px')}</div>
   <div class="nm"><b>김효성 대리</b><span>재무팀</span></div>
   <div class="exprow"><span>누적 <b>1,168 EXP</b></span><span>플래티넘까지 <b>Lv.15</b> · 232 EXP</span></div><div class="bar"><i style="width:62%"></i></div>
   <div class="mut" style="font-size:12.5px;font-weight:600;margin-top:10px">레벨 = ⌊누적 EXP ÷ 100⌋ + 1 · 티어는 레벨 구간으로 자동 결정</div></div>
  <div class="card pad" style="display:flex;flex-direction:column;min-height:0"><div class="ct"><h3>티어 진화표 <small>6단계 · 장비와 오라가 실시간으로 바뀌어요</small></h3>${B('내 티어: 골드','t-go')}</div>
   <table class="tbl tier" style="margin-top:14px"><thead><tr><th>캐릭터</th><th>티어</th><th>레벨 구간</th><th>누적 EXP</th><th>외형 · 장비</th><th>오라 파티클</th><th>인원</th></tr></thead><tbody>
   ${[['char0','브론즈','1 – 4','0 – 399','기본 사원복 · 브론즈 배지','없음','412명'],['char1','실버','5 – 9','400 – 899','은빛 망토','은빛 먼지','286명'],['char2','골드','10 – 14','900 – 1,399','황금 갑옷 · 왕관','황금 스파크','143명'],['char3','플래티넘','15 – 19','1,400 – 1,899','사이버 고글 + 오라','시안 픽셀','61명'],['char4','다이아','20 – 24','1,900 – 2,399','크리스탈 날개','크리스탈 조각','18명'],['char5','마스터','25 +','2,400 +','보랏빛 번개 아우라 + 전설의 검','보라 번개','4명']].map((r,i)=>`<tr${i===2?' class="hl"':''}><td style="height:66px">${S(r[0],2)}</td><td>${B(r[1],'s '+TIER[i][1])}${i===2?' '+B('현재','s b-solid'):''}</td><td class="num">Lv.${r[2]}</td><td class="num">${r[3]}</td><td>${r[4]}</td><td class="mut">${r[5]}</td><td class="num">${r[6]}</td></tr>`).join('')}</tbody></table></div>
 </div></div></main>`;

P['03']=()=>gnb(1)+`<main class="shell ws">${sideQuest('board')}<div class="card pad" style="display:flex;flex-direction:column;min-height:0;padding:26px 28px">
 <div class="ph"><div><div class="crumb">업무 퀘스트 ${I('chevr')} 게시판</div><h1 style="margin-top:6px">업무 퀘스트 게시판</h1><p>사내 동료의 문의에 답하고, 요청 업무를 해결해 포인트와 EXP를 모으세요.</p></div><span class="btn pri lg">${I('plus')}퀘스트 등록하기</span></div>
 <div class="row gap10" style="margin-top:22px;flex-wrap:nowrap">
  <span class="mut" style="font-size:13px;font-weight:800">분류</span><span class="fchip on">전체 <em>7</em></span><span class="fchip">문의 <em>3</em></span><span class="fchip">요청 <em>4</em></span>
  <span style="width:1px;height:24px;background:var(--border);margin:0 6px"></span>
  <span class="mut" style="font-size:13px;font-weight:800">상태</span><span class="fchip on">전체</span><span class="fchip">모집중 <em>3</em></span><span class="fchip">진행중 <em>2</em></span><span class="fchip">완료 <em>2</em></span>
  <div class="srch ml" style="width:340px">${I('search')}제목, 요청자, 부서 검색</div><div class="sel" style="height:44px;width:150px">최신순 ${I('chev')}</div></div>
 <table class="tbl" style="margin-top:18px"><thead><tr><th style="width:56px">No</th><th style="width:76px">분류</th><th style="width:150px">상태</th><th>제목</th><th style="width:150px">보상</th><th style="width:250px">요청자</th><th style="width:80px">지원자</th><th style="width:70px">조회</th><th style="width:80px">등록일</th></tr></thead><tbody>
 ${Q.map(q=>`<tr><td class="mut num">${q.no}</td><td>${tyB(q.ty)}</td><td>${stB(q.st)}</td><td><span class="tt">${q.t}</span><div class="tm">${I('cal')}마감 ${q.dl}${q.sp?` · <span style="color:var(--accent);display:inline-flex;gap:4px;align-items:center">${I('link')}SharePoint 첨부</span>`:''}</div></td>
  <td class="rw2"><b class="num">100P + ${q.b}P</b><span>현상금 에스크로</span></td><td>${usr(q.u,38)}</td><td class="num"><b>${q.ap}</b>명</td><td class="num mut">${q.vw}</td><td class="num mut">${q.dt}</td></tr>`).join('')}</tbody></table>
 <div class="row" style="margin-top:auto;padding-top:14px"><span class="mut" style="font-size:13px;font-weight:600">총 7건 · 기본 보상 100P는 시스템 지급, 현상금은 요청자 포인트에서 등록 시 선차감</span><div class="row gap6 ml">${['‹','1','›'].map((x,i)=>`<span class="btn sm${i===1?' pri':''}" style="width:36px;padding:0">${x}</span>`).join('')}</div></div>
</div></main>`;

const editorBody=`<div class="ed"><div class="mb"><span>파일</span><span>편집</span><span>보기</span><span>삽입</span><span>서식</span><span>표</span><span>도구</span></div>
 <div class="tb"><span>${I('undo')}</span><span class="dv"></span><span class="dd">본문 ${I('chev')}</span><span class="dd">Paperlogy ${I('chev')}</span><span class="dv"></span><span class="on">${I('bold')}</span><span style="font-style:italic;font-family:serif">I</span><span style="text-decoration:underline">U</span><span style="color:#7C3AED">A</span><span class="dv"></span><span>${I('align')}</span><span>${I('list')}</span><span class="dv"></span><span>${I('link')}</span><span>${I('image')}</span><span class="on">${I('table')}</span><span class="dv"></span><span>${I('clip')}</span><span class="ml" style="font-size:12px;color:var(--text-faint);font-weight:700;padding-right:8px">TinyMCE 5.10.2</span></div>
 <div class="bd"><h5>요청 배경</h5><p>3분기 결산을 위해 사업부별 원가 데이터를 매주 수작업으로 취합하고 있습니다. 원본 엑셀(SAP 추출본)을 피벗 시트로 자동 정리하는 매크로를 요청드립니다.</p>
 <h5>요청 사항</h5><table class="dtbl"><thead><tr><th style="width:28%">항목</th><th>내용</th><th style="width:20%">우선순위</th></tr></thead><tbody><tr><td>원본 시트 정리</td><td>SAP 추출 시트 → 사업부/계정별 자동 분류</td><td>필수</td></tr><tr><td>피벗 자동 생성</td><td>월별 · 사업부별 원가 피벗 + 전년 대비 증감</td><td>필수</td></tr><tr><td>실행 버튼</td><td>시트 상단 [갱신] 버튼 1클릭 실행</td><td>권장</td></tr></tbody></table>
 <p style="margin:0">※ 고객사명·단가 등 민감 정보는 비식별 처리된 샘플로 첨부했습니다.</p></div>
 <div class="sb"><span>p › table › tbody › tr</span><span>단어 142개 · 자동 저장됨</span></div></div>`;
const spBadge=(f='Q3_원가분석_원본.xlsx',sz='1.8 MB',u='Q3_cost_analysis_raw.xlsx')=>`<div class="spb"><div class="sp-logo">S</div><div class="tx"><b>${f} <span class="mut" style="font-size:12px;font-weight:600">${sz}</span></b><span class="u">https://hyosung.sharepoint.com/sites/officequest/Shared%20Documents/${f}</span></div>${B('링크 변환 완료','s b-ok',"check")}<span class="ib" style="width:36px;height:36px;font-size:16px">${I('x')}</span></div>`;
P['04']=()=>gnb(1)+`<main class="shell ws2">${sideQuest('create')}
 <div class="card" style="padding:24px 28px;display:flex;flex-direction:column;gap:18px;min-height:0">
  <div class="ph"><div><div class="crumb">업무 퀘스트 ${I('chevr')} 퀘스트 등록</div><h1 style="margin-top:6px">새 업무 퀘스트 등록</h1></div>${B('임시저장됨 14:02','b-g',"check")}</div>
  <div style="display:grid;grid-template-columns:auto 1fr;gap:14px 20px;align-items:center">
   <div><div class="lab">퀘스트 유형 <b>*</b></div><div class="seg"><span>${I('msg')}문의</span><span class="on">${I('scroll')}요청</span></div></div>
   <div class="escrow" style="margin-top:28px;background:var(--surface-muted);color:var(--text-sub)">${I('info')}<span><b style="color:var(--text)">요청</b> · 결과물(파일/문서) 제출이 필요한 업무예요. 채택된 작업자만 결과물 에디터가 열려요.</span></div></div>
  <div style="display:grid;grid-template-columns:2.2fr 1fr 1fr;gap:14px">
   <div><div class="lab">제목 <b>*</b><span>19 / 60</span></div><div class="inp focus">3분기 원가 분석 엑셀 매크로 요청<span style="width:2px;height:22px;background:var(--accent)"></span></div></div>
   <div><div class="lab">업무 분야</div><div class="sel">재무 · 엑셀 자동화 ${I('chev')}</div></div>
   <div><div class="lab">마감일</div><div class="sel">2026.10.23 (금) 18:00 ${I('cal')}</div></div></div>
  <div style="flex:1;min-height:0"><div class="lab">본문 <b>*</b><span>리치 텍스트 · 표/이미지 지원</span></div>${editorBody}</div>
  <div><div class="lab">첨부 파일 <span style="color:var(--accent)">업로드 시 SharePoint 링크로 자동 변환</span></div>${spBadge()}</div>
  <div class="row gap10"><span class="mut" style="font-size:13px;font-weight:600">${I('shield')} 등록 시 보안서약서 동의가 필요해요</span><span class="btn ml">미리보기</span><span class="btn">취소</span><span class="btn pri lg">${S('coin',3)}퀘스트 등록하기 · 300 P</span></div>
 </div>
 <div style="display:flex;flex-direction:column;gap:20px;min-height:0">
  <div class="card pad"><div class="ct"><h3>현상금</h3><b style="font-size:28px;font-weight:900;color:var(--accent)" class="num">300 P</b></div>
   <div class="trk" style="margin-top:22px"><div class="fill" style="width:30%"></div><div class="knob" style="left:30%"></div></div>
   <div class="ticks"><span>0</span><span>250</span><span>500</span><span>750</span><span>1,000</span></div>
   <div class="row gap6" style="margin-top:14px">${['50','100','300','500'].map(v=>`<span class="fchip${v==='300'?' on':''}">${v} P</span>`).join('')}</div>
   <div class="escrow">${I('lock')}<span>등록 즉시 에스크로 선차감</span><span class="fl num">1,500 ${I('arrow')} 1,200 P</span></div>
   <div class="mut" style="font-size:12.5px;font-weight:600;margin-top:10px;line-height:1.5">모집중 상태에서 삭제하면 현상금이 전액 환불돼요. 채택 이후에는 수정·삭제가 잠겨요.</div></div>
  <div class="card pad"><div class="ct"><h3>작업자 보상 미리보기</h3></div>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px;font-size:14.5px;font-weight:600">
    <div class="row"><span class="sub">기본 보상 (시스템 지급)</span><b class="ml num">100 P</b></div>
    <div class="row"><span class="sub">현상금 (에스크로)</span><b class="ml num">300 P</b></div>
    <div class="row"><span class="sub">경험치</span><b class="ml num">100 EXP</b></div>
    <div class="row" style="padding-top:10px;border-top:1px solid var(--border)"><b>완료 승인 시 총 지급</b><b class="ml num" style="font-size:20px;color:var(--accent)">400 P + 100 EXP</b></div></div></div>
  <div class="card pad"><div class="ct"><h3>등록 체크리스트</h3>${B('3/4','s')}</div>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px;font-size:14px;font-weight:600">
   ${[['유형·제목 입력',1],['본문 작성 (최소 20자)',1],['현상금 설정 (보유 P 이내)',1],['보안서약서 동의',0]].map(x=>`<div class="row gap10"><span class="cbx${x[1]?' on':''}" style="width:22px;height:22px">${I('check')}</span>${x[0]}</div>`).join('')}</div></div>
 </div></main>`;

P['05']=()=>P['04']()+`<div class="dim"></div><div class="modal" style="width:640px">
 <div class="row gap12"><span class="ic-t" style="width:52px;height:52px;font-size:26px;border-radius:15px">${I('shield')}</span><div><h2>사내 정보보안 서약서</h2><div class="mut" style="font-size:14px;font-weight:600;margin-top:4px">퀘스트 등록 전 아래 항목에 모두 동의해 주세요.</div></div><span class="ib ml" style="width:38px;height:38px">${I('x')}</span></div>
 <div style="margin-top:20px;padding:16px 18px;border-radius:16px;background:var(--surface-muted);font-size:13.5px;line-height:1.7;font-weight:500;color:var(--text-sub);height:150px;overflow:hidden">
  <b style="color:var(--text)">제1조 (목적)</b> 본 서약은 오피스퀘스트를 통해 공유되는 사내 업무 정보의 보호를 목적으로 합니다.<br>
  <b style="color:var(--text)">제2조 (기밀 유지)</b> 퀘스트 본문·첨부 파일·팀즈 대화에 포함된 정보는 해당 업무 수행 목적 외에 사용하거나 사외로 반출할 수 없습니다.<br>
  <b style="color:var(--text)">제3조 (개인정보)</b> 고객·임직원 개인정보는 비식별 처리 후 첨부해야 하며, 위반 시 사내 규정에 따라 조치됩니다.</div>
 <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px">
 ${['대외비·기밀문서를 업로드하지 않고 사내 보안 규정을 준수합니다.','개인정보·고객정보는 마스킹(비식별) 처리 후 첨부합니다.','결과물의 권리는 회사에 귀속되며 업무 목적 외 사용하지 않습니다.'].map(t=>`<div class="row gap12" style="padding:14px 16px;border-radius:14px;border:1px solid #DDD6FE;background:#FAF7FF"><span class="cbx on">${I('check')}</span><span style="font-size:15px;font-weight:700">${t}</span>${B('필수','s ml')}</div>`).join('')}</div>
 <div class="escrow" style="margin-top:16px">${I('lock')}<span>현상금 <b>300 P</b>가 에스크로로 선차감돼요</span><span class="fl num">1,500 ${I('arrow')} 1,200 P</span></div>
 <div class="row gap10" style="margin-top:20px"><span class="mut" style="font-size:12.5px;font-weight:600">서약자 김효성 대리 · 재무팀 · HS21034 · 2026.10.21</span><span class="btn ml">취소</span><span class="btn pri lg">${I('check')}동의 후 등록</span></div></div>`;

const detailHead=(st,locked)=>`<div class="crumb">업무 퀘스트 ${I('chevr')} 게시판 ${I('chevr')} No.7</div>
 <div class="row" style="margin-top:10px;align-items:flex-start"><div><div class="row gap6">${tyB('요청')}${st}${B('마감 D-2','s b-g',"cal")}</div><h1 style="font-size:30px;font-weight:800;letter-spacing:-.04em;margin-top:10px">3분기 원가 분석 엑셀 매크로 요청</h1></div>
 <div class="row gap8 ml" style="position:relative">${locked?`<span class="btn dis">${I('lock')}수정</span><span class="btn dis">${I('lock')}삭제</span><div class="tip" style="right:0;top:54px">진행중·완료 상태에서는 수정/삭제할 수 없어요.</div>`:`<span class="btn">${I('edit')}수정</span><span class="btn" style="color:var(--danger-fg)">${I('trash')}삭제</span><div class="tip" style="right:0;top:54px">삭제 시 현상금 300 P가 전액 환불돼요.</div>`}</div></div>
 <div class="row gap16" style="margin-top:16px;padding:14px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)">${usr('kim',40)}<span class="mut" style="font-size:13px;font-weight:600">${I('cal')} 2026.10.21 09:12 등록</span><span class="mut" style="font-size:13px;font-weight:600">${I('eye')} 조회 128</span><span class="mut" style="font-size:13px;font-weight:600">${I('users')} 지원 3명</span><span class="ml">${B('보상 100P + 현상금 300P','')}</span></div>`;
const reqBody=`<div style="font-size:14.5px;line-height:1.7;font-weight:500;color:var(--text-sub);margin-top:18px"><b style="color:var(--text);font-size:16px">요청 배경</b><p style="margin:4px 0 12px">3분기 결산을 위해 사업부별 원가 데이터를 매주 수작업으로 취합하고 있습니다. SAP 추출 원본 엑셀을 피벗 시트로 자동 정리하는 매크로를 요청드립니다.</p>
 <table class="dtbl"><thead><tr><th style="width:26%">항목</th><th>내용</th><th style="width:16%">우선순위</th></tr></thead><tbody><tr><td>원본 시트 정리</td><td>SAP 추출 시트 → 사업부/계정별 자동 분류</td><td>필수</td></tr><tr><td>피벗 자동 생성</td><td>월별 · 사업부별 원가 피벗 + 전년 대비 증감</td><td>필수</td></tr><tr><td>실행 버튼</td><td>시트 상단 [갱신] 버튼 1클릭 실행</td><td>권장</td></tr></tbody></table></div>`;
const aps=[['lee','“오늘 6시 전까지 끝내겠습니다!”','10:02'],['jung','“엑셀 매크로라면 자신 있어요. VBA 경력 5년입니다.”','10:31'],['oh','“배우면서 꼼꼼히 해보겠습니다.”','11:15']];
P['06']=()=>gnb(1)+`<main class="shell ws2">${sideQuest('board')}
 <div class="card" style="padding:24px 28px;display:flex;flex-direction:column;min-height:0">${detailHead(stB('모집중'),0)}${reqBody}
  <div style="margin-top:6px"><div class="lab">첨부 파일</div>${spBadge()}</div>
  <div style="margin-top:18px;border:1px dashed var(--border-strong);border-radius:18px;padding:18px 20px;background:var(--surface-muted)">
   <div class="row gap12"><span class="ic-t" style="background:var(--danger-bg);color:var(--danger-fg)">${I('lock')}</span><div><b style="font-size:16px">결과물 제출 에디터가 잠겨 있어요</b><div class="mut" style="font-size:13px;font-weight:600;margin-top:3px">지원자 1명을 채택하면 작업자 전용 리치 에디터와 SharePoint 업로드 폼이 열려요.</div></div>${B('채택 전 잠금','b-danger ml',"lock")}</div>
   <div style="margin-top:14px;opacity:.45"><div class="ed"><div class="tb"><span>${I('bold')}</span><span>I</span><span>U</span><span class="dv"></span><span>${I('list')}</span><span>${I('table')}</span><span>${I('clip')}</span></div><div class="bd" style="height:44px;color:var(--text-faint)">작업자만 작성할 수 있어요</div></div></div></div>
  <div style="margin-top:auto;display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${[['users','채택은 1명만','지원자 중 딱 1명을 채택하면 자동으로 진행중'],['lock','채택 후 수정·삭제 잠금','진행중·완료에서는 게시글 편집 불가'],['undo','반려 = 보완 요청','사유 입력 시 진행중(보완요청) 유지'],['gift','승인 = 즉시 보상','100 P + 현상금 · 100 EXP 지급']].map(r=>`<div style="padding:14px;border-radius:14px;background:var(--surface-muted)"><div class="row gap8"><span class="ic-t" style="width:30px;height:30px;font-size:15px;border-radius:9px">${I(r[0])}</span><b style="font-size:14px">${r[1]}</b></div><div class="mut" style="font-size:12.5px;font-weight:600;margin-top:8px;line-height:1.5">${r[2]}</div></div>`).join('')}</div>
 </div>
 <div style="display:flex;flex-direction:column;gap:20px;min-height:0">
  <div class="card pad"><div class="ct"><h3>보상</h3>${B('에스크로 보관중','s b-ok',"lock")}</div>
   <div class="row gap12" style="margin-top:14px">${S('coin',6)}<div><b class="num" style="font-size:30px;font-weight:900;letter-spacing:-.03em">400 P</b><div class="mut" style="font-size:13px;font-weight:600">기본 100 P + 현상금 300 P · +100 EXP</div></div></div></div>
  <div class="card pad" style="flex:1;display:flex;flex-direction:column"><div class="ct"><h3>지원자 리스트 <small>3명</small></h3>${B('1명만 채택 가능','s b-g')}</div>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
   ${aps.map(([u,q,tm])=>`<div style="padding:14px;border-radius:16px;border:1px solid var(--border)"><div class="row gap12">${av(u,48)}<div style="flex:1;min-width:0"><b style="font-size:15.5px">${U[u].n}</b><div class="row gap6" style="margin-top:4px">${tb(U[u].t,U[u].lv)}<span class="mut" style="font-size:12px;font-weight:600">${U[u].d} · ${U[u].v}</span></div></div></div>
    <div style="font-size:13.5px;font-weight:600;color:var(--text-sub);margin:10px 0 10px">${q}</div><div class="row"><span class="mut" style="font-size:12px;font-weight:600">${I('shield')} 보안서약 동의 · 오늘 ${tm}</span><span class="btn sm pri ml">${I('check')}채택하기</span></div></div>`).join('')}</div></div>
 </div></main>`;

P['07']=()=>gnb(1)+`<main class="shell ws2">${sideQuest('board')}
 <div class="card" style="padding:24px 28px;display:flex;flex-direction:column;min-height:0">${detailHead(stB('진행중'),1)}
  <div class="row gap12" style="margin-top:16px;padding:14px 16px;border-radius:16px;background:var(--accent-soft)">${av('lee',44)}<div><b style="font-size:15px">채택된 작업자 · 이퀘스트 사원</b><div class="row gap6" style="margin-top:3px">${tb(1,7)}<span class="mut" style="font-size:12px;font-weight:600">생산기술팀 · 창원마을 · 10.21 10:40 채택</span></div></div><span class="btn btn-teams ml">${I('msg')}팀즈 대화하기 · 업무 인수인계</span></div>
  <div style="margin-top:18px;border:1px solid var(--border);border-radius:18px;overflow:hidden;flex:1;display:flex;flex-direction:column;min-height:0">
   <div class="row gap10" style="padding:14px 18px;background:var(--surface-muted);border-bottom:1px solid var(--border)"><b style="font-size:16px">제출된 결과물</b>${B('v1 제출 · 10.21 15:40','s b-g')}${B('검수 대기','s b-wait ml')}</div>
   <div style="padding:18px 20px;font-size:14.5px;line-height:1.7;font-weight:500;color:var(--text-sub)"><b style="color:var(--text)">작업 요약</b><p style="margin:4px 0 10px">SAP 추출 시트를 사업부 · 계정 기준으로 자동 분류하고, 월별 원가 피벗과 전년 대비 증감 시트를 생성하는 매크로를 작성했습니다. 시트 상단 [갱신] 버튼으로 실행됩니다.</p>
    <table class="dtbl"><thead><tr><th>산출물</th><th style="width:22%">처리 시간</th><th style="width:22%">비고</th></tr></thead><tbody><tr><td>사업부/계정 자동 분류</td><td>수작업 2시간 → 12초</td><td>완료</td></tr><tr><td>월별 원가 피벗 + 증감</td><td>수작업 1시간 → 4초</td><td>완료</td></tr></tbody></table>
    ${spBadge('Q3_원가분석_자동화_v1.xlsm','2.4 MB','Q3_cost_automation_v1.xlsm')}</div>
   <div class="row gap10" style="margin-top:auto;padding:14px 18px;border-top:1px solid var(--border)"><span class="mut" style="font-size:13px;font-weight:600">${I('info')} 승인 즉시 작업자에게 100 P + 현상금 300 P, 100 EXP가 지급돼요</span><span class="btn rej lg ml">${I('undo')}반려 (보완 요청)</span><span class="btn pri lg">${I('check')}퀘스트 완료 (승인)</span></div></div>
 </div>
 <div style="display:flex;flex-direction:column;gap:20px;min-height:0">
  <div class="card pad"><div class="ct"><h3>진행 상태</h3>${B('진행중','s')}</div>
   <div style="display:flex;flex-direction:column;gap:2px;margin-top:14px">
   ${[['모집중','10.21 09:12',2],['지원 3명','10.21 11:15',2],['채택 · 이퀘스트 사원','10.21 10:40',2],['결과물 제출 v1','10.21 15:40',1],['검수 (반려 / 승인)','',0],['완료 · 보상 지급','',0]].map(s=>`<div class="row gap12" style="height:44px"><span style="width:26px;height:26px;border-radius:8px;display:grid;place-items:center;font-size:14px;${s[2]===2?'background:var(--accent);color:#fff':s[2]===1?'background:var(--accent-soft);color:var(--accent);box-shadow:0 0 0 4px rgba(124,58,237,.12)':'border:1px solid var(--border);color:var(--text-faint)'}">${s[2]===2?I('check'):''}</span><b style="font-size:14.5px;${s[2]?'':'color:var(--text-muted)'}">${s[0]}</b><span class="ml mut num" style="font-size:12px;font-weight:600">${s[1]}</span></div>`).join('')}</div></div>
 </div>
 <div class="teams"><div class="tm-h"><div class="tm-logo">T</div><div class="av">${S('head1',2)}<span class="on"></span></div><div><b>이퀘스트 사원</b><span>생산기술팀 · 창원마을 · 대화 가능</span></div><div class="x">${I('min')}${I('x')}</div></div>
  <div class="tm-b"><div class="sysm">업무 인수인계 · 3분기 원가 분석 엑셀 매크로 요청</div>
   <div class="msg me"><span class="w">김효성 대리 · 10:42</span>채택했어요! 원본은 SharePoint에 올려뒀어요. 피벗 시트만 자동화 부탁드려요.</div>
   <div class="msg you"><span class="w">이퀘스트 사원 · 10:44</span>확인했습니다! 계정 코드 매핑표도 있으면 같이 부탁드려요.</div>
   <div class="msg me"><span class="w">김효성 대리 · 15:46</span>v1 확인 중이에요. 피벗 필터에 사업부 '기타'가 빠진 것 같아요.</div>
   <div class="typing"><div class="dots"><i></i><i style="transform:translateY(-4px)"></i><i></i></div>상대방이 입력 중입니다...</div></div>
  <div class="tm-in"><div class="f">메시지 입력</div><div class="s">${I('send')}</div></div></div>
 </main>`;

P['08']=()=>P['07']().replace(/<div class="teams">[\s\S]*<\/main>$/,'</main>')+`<div class="hf"><div class="back"></div><div class="scan"></div><div class="rays" style="left:1180px;top:600px"></div><canvas id="hfc" width="1920" height="1080"></canvas>
 <div style="position:absolute;left:0;right:0;top:86px;text-align:center"><div style="font-size:120px;font-weight:900;letter-spacing:-.04em;line-height:1;background:linear-gradient(180deg,#fff 30%,#D8B4FE);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 6px 0 #5B21B6)">LEVEL UP!</div>
  <span style="display:inline-flex;margin-top:18px;gap:12px;align-items:center;font-size:24px;font-weight:700;color:#E9D5FF;padding:10px 22px;border-radius:99px;background:rgba(124,58,237,.25);border:1px solid rgba(168,85,247,.5)">이퀘스트 사원 · 실버 Lv.7 ${I('arrow')} Lv.8</span></div>
 <div style="position:absolute;left:1590px;top:300px;font-size:72px;font-weight:900;color:#fff;letter-spacing:-.03em;text-shadow:0 6px 0 #6D28D9,0 0 30px rgba(168,85,247,.8)">-9,999</div>
 <div style="position:absolute;left:1188px;top:452px;width:260px;text-align:center;color:#fff"><b style="font-size:17px;font-weight:800;white-space:nowrap">업무 병목 슬라임 · 보스</b><div style="height:14px;border-radius:4px;background:#27272A;border:2px solid #52525B;margin-top:8px"></div></div>
 <div style="position:absolute;left:0;right:0;bottom:150px;display:flex;justify-content:center;gap:18px">${[['coin','+100 P','기본 보상'],['coin','+300 P','현상금'],['gem','+100 EXP','경험치']].map(r=>`<div style="display:flex;align-items:center;gap:14px;height:84px;padding:0 28px 0 18px;border-radius:22px;background:rgba(18,18,26,.88);border:1px solid rgba(168,85,247,.45);color:#fff;font-size:34px;font-weight:900;letter-spacing:-.02em;box-shadow:0 0 40px -10px rgba(168,85,247,.6)">${S(r[0],5)}${r[1]}<small style="font-size:17px;font-weight:600;color:#C4B5FD">${r[2]}</small></div>`).join('')}</div>
 <div style="position:absolute;left:0;right:0;bottom:84px;text-align:center;font-size:24px;font-weight:600;color:#D4D4D8">퀘스트 완료 승인 · <b style="color:#fff">보상이 이퀘스트 사원에게 즉시 지급되었습니다</b> · 1.8초 후 자동 닫힘</div>
 <div style="position:absolute;left:0;right:0;top:770px;height:6px;background:repeating-linear-gradient(90deg,#3F3F46 0 24px,transparent 24px 40px);opacity:.8"></div></div>`;

const card=(m,dark)=>`<div class="card pc${m.st==='거래완료'?' sold':''}"><div class="th" style="background:${dark?`linear-gradient(160deg,${m.tc[1]},#121218)`:m.tc[0]}">${B(m.v,'s b1')}<span class="b2">${mkB(m.st)}</span>${S(m.s,8)}<span class="cnt">${I('image')} 1/3</span></div>
 <div class="bd"><div class="ca"><span>${m.c}</span><span>${m.p?'포인트 판매':'무료 나눔'}</span></div><div class="tt">${m.t}</div><div class="pr">${price(m.p)}<div class="mt"><span class="hrt${m.lk>30?' lk':''}">${I('heart')}${m.lk}</span><span>${I('eye')}${m.vw}</span></div></div>
 <div class="sl">${av(m.u,26)}${U[m.u].n}<span class="mut" style="margin-left:auto;font-weight:600">${U[m.u].d}</span></div></div></div>`;
P['09']=()=>gnb(2,'lee',true,300)+`<main class="shell ws">${sideVillage(0)}<div style="display:flex;flex-direction:column;gap:16px;min-height:0">
 <div class="ph"><div><div class="crumb">효성마을 ${I('chevr')} 전체 마을 모아보기</div><h1 style="margin-top:6px">포인트로 사고, <em>나누고, 순환하고.</em></h1></div><div class="row gap10"><div class="srch" style="width:380px">${I('search')}물품명, 마을, 판매자 검색</div><div class="sel" style="height:44px;width:150px">최신순 ${I('chev')}</div></div></div>
 <div class="row gap8">${[['전체',18],['디지털/가전',2],['생활/주방',1],['의류/잡화',1],['도서/티켓/쿠폰',2],['취미/기타',2]].map((c,i)=>`<span class="fchip${i?'':' on'}">${c[0]} <em>${c[1]}</em></span>`).join('')}<span class="fchip ml">${I('filter')}거래가능만</span><span class="fchip">${I('gift')}무료나눔</span></div>
 <div class="pgrid">${M.map(m=>card(m,true)).join('')}</div></div></main>`;

P['10']=()=>gnb(2,'kim',false,1500)+`<main class="shell ws">${sideVillage(1)}<div class="card" style="padding:26px 28px;display:grid;grid-template-columns:620px 1fr;gap:32px;min-height:0">
 <div><div class="crumb">효성마을 ${I('chevr')} 마포마을 ${I('chevr')} 디지털/가전</div>
  <div style="margin-top:14px;height:520px;border-radius:22px;background:#EDE9FE;display:grid;place-items:center;position:relative">${S('monitor',26)}<span class="badge b-solid" style="position:absolute;left:16px;top:16px">마포마을</span></div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px">${['monitor','keyboard','monitor','image'].map((s,i)=>`<div style="height:96px;border-radius:14px;background:${i?'var(--surface-muted)':'#EDE9FE'};display:grid;place-items:center;${i===0?'box-shadow:inset 0 0 0 2px #7C3AED':''}">${s==='image'?`<span class="mut" style="font-size:13px;font-weight:700">${I('plus')} 사진 추가</span>`:S(s,4)}</div>`).join('')}</div></div>
 <div style="display:flex;flex-direction:column;min-width:0"><div class="row gap6">${B('거래가능','b-ok')}${B('디지털/가전','b-g')}${B('포인트 판매','b-g')}</div>
  <h1 style="font-size:34px;font-weight:800;letter-spacing:-.04em;margin-top:12px">27인치 QHD 모니터</h1>
  <div class="row gap12" style="margin-top:10px"><b class="num" style="font-size:40px;font-weight:900;letter-spacing:-.03em">500 P</b><div class="mt ml"><span class="hrt lk">${I('heart')}24</span><span>${I('eye')}132</span><span>${I('clock')}2시간 전</span></div></div>
  <div class="row gap12" style="margin-top:18px;padding:14px 16px;border-radius:16px;background:var(--surface-muted)">${av('kim',44)}<div><b style="font-size:15px">김효성 대리 <span class="badge s b-solid">나 · 판매자</span></b><div class="mut" style="font-size:12.5px;font-weight:600;margin-top:3px">재무팀 · 마포 본사 12층 · 거래 후기 4.9</div></div></div>
  <div style="font-size:14.5px;line-height:1.75;font-weight:500;color:var(--text-sub);margin-top:18px">재택 근무용으로 1년 사용한 27인치 QHD(2560×1440) IPS 모니터입니다. 데드픽셀 없고 HDMI·DP 케이블 포함이에요. 마포 본사 1층 로비에서 점심시간 직거래 선호합니다.</div>
  <div style="margin-top:18px;padding:16px;border-radius:16px;border:1px solid var(--border)"><b style="font-size:15px">거래 상태 변경 <span class="mut" style="font-size:12.5px;font-weight:600">판매자 전용</span></b>
   <div class="seg" style="margin-top:12px;width:100%"><span class="on" style="flex:1;justify-content:center">거래가능</span><span style="flex:1;justify-content:center">예약중</span><span style="flex:1;justify-content:center">거래완료</span></div>
   <div class="mut" style="font-size:12.5px;font-weight:600;margin-top:10px">예약중 · 거래완료로 바꾸려면 조직도에서 예약자 또는 최종 구매자를 지정하세요.</div></div>
  <div class="row gap10" style="margin-top:auto"><span class="btn">${I('edit')}수정</span><span class="btn">${I('users')}조직도에서 지정</span><span class="btn dis ml">${I('msg')}내 글에는 팀즈 대화가 없어요</span></div></div>
 </div></main>
 <div class="dim"></div><div class="modal" style="width:1180px;padding:0;overflow:hidden">
  <div class="row gap12" style="padding:24px 28px;border-bottom:1px solid var(--border)"><span class="ic-t" style="width:48px;height:48px;font-size:23px;border-radius:14px">${I('users')}</span><div><h2>그룹웨어 조직도</h2><div class="mut" style="font-size:13.5px;font-weight:600;margin-top:3px">예약자 / 최종 구매자 지정 · 27인치 QHD 모니터 · <b style="color:var(--accent)">500 P</b></div></div><span class="ib ml" style="width:38px;height:38px">${I('x')}</span></div>
  <div style="display:grid;grid-template-columns:320px 1fr;height:540px">
   <div style="padding:18px 16px;border-right:1px solid var(--border);background:var(--surface-muted)"><div class="mut" style="font-size:12px;font-weight:800;letter-spacing:.06em;padding:0 10px 8px">사업장</div>
    <div class="tn">${I('chevr')}${I('building')}마포 본사<em>128명</em></div>
    <div class="tn">${I('chevr')}${I('building')}회현<em>42명</em></div>
    <div class="tn">${I('chevr')}${I('building')}반포<em>57명</em></div>
    <div class="tn">${I('chevr')}${I('building')}수서<em>64명</em></div>
    <div class="tn">${I('chev')}${I('building')}창원공장<em>212명</em></div>
    <div class="tn l1 on">${I('chev')}생산기술팀<em>38명</em></div>
    <div class="tn l2">품질경영팀<em>27명</em></div>
    <div class="tn l2">설비보전팀<em>31명</em></div>
    <div class="tn">${I('chevr')}${I('building')}울산공장<em>186명</em></div></div>
   <div style="padding:18px 22px;display:flex;flex-direction:column;gap:10px;min-height:0">
    <div class="row gap10"><div class="inp focus" style="flex:1;height:46px;font-size:15px;color:var(--text-faint)">${I('search')}<span>이름, 사번, 부서로 검색</span><span style="width:2px;height:20px;background:var(--accent)"></span></div><span class="fchip on">관심 표시 · 팀즈 문의 직원</span><span class="fchip">구매 가능(500 P 이상)만</span></div>
    <div class="mut" style="font-size:12.5px;font-weight:700">이 물품에 좋아요·팀즈 문의를 남긴 직원 6명 · 보유 포인트 실시간 표시</div>
    ${[['jung','HS19044',1,'sel'],['choi','HS16011',0],['kang','HS22031',0],['han','HS17052',0],['lee','HS24017',0,'low'],['oh','HS26003',0,'low']].map(([u,id,_,c])=>`<div class="emp ${c||''}">${av(u,42)}<div class="w"><b>${U[u].n}</b> ${tb(U[u].t,U[u].lv)}<div class="m">${id} · ${U[u].site} · ${U[u].d}</div></div><div class="pt num">${U[u].p.toLocaleString('en-US')}<small>P</small></div>
     ${c==='low'?`<span class="btn sm dis">${I('lock')}포인트 부족</span><span class="btn sm dis">최종 구매자 지정</span>`:c==='sel'?`<span class="btn sm pri">${I('check')}예약자 지정됨</span><span class="btn sm">최종 구매자 지정</span>`:`<span class="btn sm">예약자 지정</span><span class="btn sm">최종 구매자 지정</span>`}</div>`).join('')}
   </div></div>
  <div class="row gap10" style="padding:16px 28px;border-top:1px solid var(--border);background:var(--surface-muted)"><span style="font-size:14px;font-weight:700">${I('info')} 정플래 대리를 <b style="color:var(--warning-fg)">예약자</b>로 지정 → 상태가 <b>예약중</b>으로 바뀌고, 다른 직원의 [샀어요] 버튼은 비활성화돼요.</span><span class="btn ml">취소</span><span class="btn pri">${I('check')}적용하기</span></div></div>`;

/* ---------- HF canvas ---------- */
function drawHF(){const c=document.getElementById('hfc');if(!c)return;const x=c.getContext('2d');x.imageSmoothingEnabled=false;const SP=window.SP,R=window.rng(41);
 const spr=(n,px,py,sc,a=1,fx=1)=>{const s=SP[n];x.globalAlpha=a;x.save();x.translate(Math.round(px),Math.round(py));x.scale(fx,1);x.drawImage(s,-s.width*sc/2,-s.height*sc/2,s.width*sc,s.height*sc);x.restore()};
 // slime breaking
 spr('slime',1318,640,14,.55);
 for(let i=0;i<60;i++){const a=R()*Math.PI*2,d=60+R()*300,s=[10,14,18][R()*3|0];x.globalAlpha=.5+R()*.5;x.fillStyle=['#4ade80','#22c55e','#dcfce7','#166534'][R()*4|0];x.fillRect(Math.round((1318+Math.cos(a)*d)/2)*2,Math.round((650+Math.sin(a)*d*.7)/2)*2,s,s)}
 // slash arc
 x.lineCap='round';const cx=1300,cy=650,r=260,a0=-2.4,a1=.9;for(let i=0;i<30;i++){const f0=i/30,f1=(i+1)/30;x.globalAlpha=.2+.8*f1;x.strokeStyle='#a855f7';x.lineWidth=6+48*f1;x.shadowColor='#a855f7';x.shadowBlur=30;x.beginPath();x.arc(cx,cy,r,a0+(a1-a0)*f0,a0+(a1-a0)*f1);x.stroke();x.shadowBlur=0;x.strokeStyle='#f5f3ff';x.lineWidth=2+14*f1;x.beginPath();x.arc(cx,cy,r,a0+(a1-a0)*f0,a0+(a1-a0)*f1);x.stroke()}
 // hero
 spr('char1',900,640,12,1);
 // coins & gems
 for(let i=0;i<70;i++){const px=R()*1920,py=R()*1000;if(py>800&&px>500&&px<1420)continue;if(py<300&&px>560&&px<1360)continue;spr(['coin','coin','gem','star'][R()*4|0],px,py,4+R()*3,.6+R()*.4,Math.cos(R()*6))}
 x.globalAlpha=1}

/* ---------- boot ---------- */
const q=new URLSearchParams(location.search),id=q.get('p')||'01';
document.documentElement.dataset.theme=id==='09'||id==='08'&&false?'dark':'light';
if(id==='09')document.documentElement.dataset.theme='dark';
document.body.innerHTML=bg+P[id]();
window.applySprites();window.applyIcons();
window.__ready=Promise.race([document.fonts.ready.then(()=>Promise.all(['400','600','700','800','900'].map(w=>document.fonts.load(w+' 20px Paperlogy','오피스퀘스트A1')))),new Promise(r=>setTimeout(r,4000))]).then(()=>{drawHF();return true});
})();
