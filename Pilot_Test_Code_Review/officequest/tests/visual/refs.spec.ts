import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Page, TestInfo } from '@playwright/test';
import { test, expect, bootstrap, agreePledge, getDB, scenario } from '../e2e/helpers';
import { attachSpreadsheet, prepareQuest } from '../e2e/quest-helpers';
import { itemCards, openOrg } from '../e2e/market-helpers';
import { captureComparison, REFERENCE_NAMES, writeComparisonManifest, type ComparisonResult } from './comparison-helpers';

// Playwright discovers compare.spec before refs.spec. Refresh comparisons after
// all current-run captures exist so the final review never sees stale images.
test.afterAll(async ({browser})=>{
  const page=await browser.newPage({viewport:{width:1920,height:1080}}),results:ComparisonResult[]=[];
  try { for(const name of REFERENCE_NAMES)results.push(await captureComparison(page,name));await writeComparisonManifest(results); }
  finally { await page.close(); }
});

async function common(page:Page,testInfo:TestInfo,sidebar:boolean|'village'=false){
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByTestId('gnb')).toBeVisible();
  const gnb=await page.getByTestId('gnb').boundingBox();expect(gnb!.height).toBe(64);
  for(const id of ['nav-dashboard','nav-quests','nav-village','timer-display','points-chip','persona-switcher','theme-toggle'])await expect(page.getByTestId(id)).toBeVisible();
  await expect(page.getByTestId('nav-admin')).toHaveCount(0);
  const style=await page.evaluate(()=>({font:getComputedStyle(document.body).fontFamily,fontLoaded:document.fonts.check('800 16px Paperlogy'),background:getComputedStyle(document.body).backgroundColor,scrollWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),width:innerWidth,text:document.body.innerText}));
  expect(style.font.replaceAll('"','')).toMatch(/^Paperlogy/);const theme=await page.locator('html').getAttribute('data-theme');expect(style.background).toBe(theme==='dark'?'rgb(9, 9, 11)':'rgb(250, 250, 252)');expect(style.scrollWidth).toBeLessThanOrEqual(style.width);expect(style.text).not.toMatch(/\p{Extended_Pictographic}/u);
  if(!style.fontLoaded)testInfo.annotations.push({type:'ENV-SKIP',description:'Paperlogy font face unavailable; configured fallback checked'});
  if(sidebar){const width=await page.getByTestId(sidebar==='village'?'village-tab-all':'side-quest-daily').evaluate(el=>el.closest('aside')?.getBoundingClientRect().width);expect(width).toBeGreaterThanOrEqual(262);expect(width).toBeLessThanOrEqual(266);}
}
async function capture(page:Page,name:string){
  const directory=path.resolve('qa/screens');await mkdir(directory,{recursive:true});
  const styles=await page.locator('[data-testid],.quest-rules,.review-bar,.quest-timeline').evaluateAll(elements=>elements.map(el=>{const computed=getComputedStyle(el),box=el.getBoundingClientRect();return {id:el.getAttribute('data-testid'),className:el.getAttribute('class'),color:computed.color,background:computed.backgroundColor,fontFamily:computed.fontFamily,fontSize:computed.fontSize,display:computed.display,gridTemplateColumns:computed.gridTemplateColumns,bbox:{x:box.x,y:box.y,width:box.width,height:box.height}};}));
  const documentState=await page.evaluate(()=>({fontFamily:getComputedStyle(document.body).fontFamily,fontLoaded:document.fonts.check('800 16px Paperlogy'),background:getComputedStyle(document.body).backgroundColor,viewport:{width:innerWidth,height:innerHeight}}));
  await writeFile(path.join(directory,`${name}.document.json`),JSON.stringify(documentState,null,2));
  await writeFile(path.join(directory,`${name}.styles.json`),JSON.stringify(styles,null,2));await page.screenshot({path:path.join(directory,`${name}.png`),fullPage:false,animations:'disabled'});
}

test('01 dashboard light: seeded information, four cards, ranking and feeds @p3',async({page},testInfo)=>{
  await bootstrap(page);await common(page,testInfo);
  const character=page.getByTestId('dash-character-card');
  await expect(character.locator('[data-testid="pixel-sprite"][data-tier="gold"]')).toBeVisible();
  await expect(page.getByTestId('dash-level')).toContainText('12');await expect(page.getByTestId('dash-points')).toContainText('1,500');await expect(page.getByTestId('dash-today-completed')).toContainText(/0\s*\/\s*2/);await expect(page.getByTestId('dash-completed-total')).toContainText('23');await expect(page.getByTestId('dash-season-dday')).toContainText('D-14');await expect(page.getByTestId('dash-daily-ring')).toContainText(/1\s*\/\s*4/);
  await expect(page.getByText(/진행률 78%/)).toBeVisible();
  const ranking=page.locator('[data-testid^="ranking-row-"]');await expect(ranking).toHaveCount(5);expect(await ranking.evaluateAll(rows=>rows.map(row=>row.getAttribute('data-user')))).toEqual(['park','choi','jung','kim','lee']);
  await expect(page.getByTestId('dash-feed-quests').getByRole('link')).toHaveCount(3);await expect(page.getByTestId('dash-feed-items').getByRole('link')).toHaveCount(3);
  const grid=await character.evaluate(el=>{let parent=el.parentElement;while(parent&&!parent.querySelector('[data-testid="dash-daily-card"]'))parent=parent.parentElement;return {children:parent?.children.length,columns:parent?getComputedStyle(parent).gridTemplateColumns.split(/\s+/).length:0};});expect(grid.children).toBe(4);expect(grid.columns).toBe(3);
  await expect(character.locator('canvas[data-loaded="true"]')).toBeVisible();
  await capture(page,'01_dashboard_light');
});
test('02 daily quests: four missions, enabled actions, all six distinct visible tier sprites @p3',async({page},testInfo)=>{
  await bootstrap(page,{route:'/quests/daily'});await common(page,testInfo,true);
  await expect(page.locator('[data-testid^="daily-card-"]')).toHaveCount(4);await expect(page.getByTestId('daily-claim-login')).toBeEnabled();for(const key of ['post','complete','adopted'])await expect(page.getByTestId(`daily-go-${key}`)).toBeEnabled();
  const tiers=page.locator('[data-testid^="tier-row-"]');await expect(tiers).toHaveCount(6);await expect(page.getByTestId('tier-row-gold')).toHaveAttribute('data-current','true');
  await expect.poll(()=>tiers.locator('canvas[data-loaded="true"]').count()).toBe(6);
  const images=await tiers.locator('canvas[data-testid="pixel-sprite"]').evaluateAll(canvases=>canvases.map(el=>{const canvas=el as HTMLCanvasElement,pixels=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;let alpha=0;for(let i=3;i<pixels.length;i+=4)alpha+=pixels[i]!;return {alpha,url:canvas.toDataURL()};}));expect(images).toHaveLength(6);for(const image of images)expect(image.alpha).toBeGreaterThan(0);expect(new Set(images.map(image=>image.url)).size).toBe(6);
  await capture(page,'02_daily_quests_tiers');
});

test('03 quest board: seven rows, all filter counts and revision state @p4a',async({page},testInfo)=>{
  await bootstrap(page,{route:'/quests/board'});await common(page,testInfo,true);
  const rows=page.locator('tr[data-testid^="board-row-"]');await expect(rows).toHaveCount(7);await expect(rows.first()).toHaveAttribute('data-testid','board-row-7');
  for(const [type,count] of [['all',7],['inquiry',3],['request',4]])await expect(page.getByTestId(`board-filter-type-${type}`)).toContainText(String(count));
  for(const [status,count] of [['recruiting',3],['in_progress',2],['revision',1],['done',2]])await expect(page.getByTestId(`board-filter-status-${status}`)).toContainText(String(count));
  await expect(page.getByTestId('board-row-status-4')).toHaveText('진행중 · 보완요청');
  const headers=await page.locator('table thead th').allTextContents();expect(headers.map(text=>text.trim())).toEqual(['No','분류','상태','제목','보상','요청자','지원 / 답변','조회','등록일']);
  await capture(page,'03_quest_board');
});

async function referenceQuestForm(page:Page){
  await prepareQuest(page,{title:'3분기 원가 분석 엑셀 매크로 요청'});await attachSpreadsheet(page,'Q3_원가분석_원본.xlsx',Math.round(1.8*1048576));
  await page.getByTestId('quest-title').focus();
}
test('04 quest create: real editor, SharePoint attachment and escrow/reward checklist preview @p4a',async({page},testInfo)=>{
  await bootstrap(page,{route:'/quests/new'});await common(page,testInfo,true);await referenceQuestForm(page);
  await expect(page.getByTestId('sharepoint-badge')).toContainText('1.8 MB');await expect(page.getByTestId('quest-escrow-preview')).toContainText(/1,500[\s\S]*1,200/);await expect(page.getByTestId('quest-reward-preview')).toContainText(/400 P\s*100 EXP/);await expect(page.getByTestId('quest-checklist')).toContainText('3/4');
  await expect(page.getByTestId('quest-body-editor').locator('.tox-toolbar__primary,[role="toolbar"]').first()).toBeVisible();await expect(page.getByText(/This domain is not registered|API key/i)).toHaveCount(0);
  await capture(page,'04_quest_create');
});
test('05 security pledge: accessible modal, three required checks and exact escrow summary @p4a',async({page},testInfo)=>{
  await bootstrap(page,{route:'/quests/new'});await common(page,testInfo,true);await referenceQuestForm(page);const before=await getDB(page);
  await page.getByTestId('quest-submit').click();const modal=page.getByTestId('pledge-modal');await expect(modal).toHaveAttribute('role','dialog');await expect(page.getByTestId('pledge-confirm')).toBeDisabled();
  await agreePledge(page);await expect(page.getByTestId('pledge-confirm')).toBeEnabled();await expect(modal).toContainText('300 P');await expect(modal).toContainText(/1,500[\s\S]*1,200/);expect(await getDB(page)).toEqual(before);
  const bbox=await modal.boundingBox();expect(bbox!.width).toBeGreaterThanOrEqual(638);expect(bbox!.width).toBeLessThanOrEqual(642);
  await capture(page,'05_security_pledge_modal');
});

test('06 recruiting quest: locked worker editor, three applicants/adoption buttons and escrow reward @p4b',async({page},testInfo)=>{
  await bootstrap(page,{route:'/quests/7'});await common(page,testInfo,true);await expect(page.getByTestId('quest-status-badge')).toHaveAttribute('data-status','recruiting');await expect(page.getByTestId('quest-edit-btn')).toBeEnabled();await expect(page.getByTestId('quest-delete-btn')).toBeEnabled();await expect(page.getByTestId('worker-editor')).toHaveAttribute('data-locked','true');
  await expect(page.locator('[data-testid^="applicant-row-"]')).toHaveCount(3);await expect(page.locator('[data-testid^="adopt-btn-"]')).toHaveCount(3);await expect(page.getByTestId('quest-detail')).toContainText(/400\s*P/);await capture(page,'06_quest_detail_recruiting');
});
test('07 in-progress quest: pending submission, locked editing, worker and four-message Teams typing @p4b',async({page},testInfo)=>{
  await bootstrap(page,{route:'/quests/7'});await scenario(page,'ref07');await common(page,testInfo,true);await expect(page.getByTestId('quest-edit-btn')).toBeDisabled();await expect(page.getByTestId('quest-delete-btn')).toBeDisabled();
  await expect(page.locator('[data-testid="disabled-reason"][data-for="quest-edit-btn"]')).toContainText('진행중·완료 상태에서는 수정/삭제할 수 없어요');
  for(const id of ['adopted-worker-strip','submission-v1','reject-btn','approve-btn'])await expect(page.getByTestId(id)).toBeVisible();await page.getByTestId('teams-open-btn').click();await page.evaluate(()=>window.__OQ_TEST__!.showTypingFor('handover:7:kim:lee'));await expect(page.getByTestId('teams-msg')).toHaveCount(4);await expect(page.getByTestId('teams-typing')).toBeVisible();
  const chat=await page.getByTestId('teams-chat').boundingBox();expect(chat!.width).toBeGreaterThanOrEqual(418);expect(chat!.width).toBeLessThanOrEqual(422);expect(chat!.height).toBeGreaterThanOrEqual(558);expect(chat!.height).toBeLessThanOrEqual(562);
  const timeline=await page.locator('.quest-timeline').boundingBox();expect(timeline).not.toBeNull();expect(timeline!.y+timeline!.height,'timeline ends above the floating Teams chat').toBeLessThanOrEqual(chat!.y);await capture(page,'07_quest_detail_inprogress_teams');
});
test('08 completion hyperframe: frozen1000ms scene,9999z-index,three rewards and level-up @p4b',async({page},testInfo)=>{
  await bootstrap(page,{route:'/quests/7'});await scenario(page,'ref07');await common(page,testInfo,true);
  await page.evaluate(()=>window.__OQ_TEST__!.playHyperFrame('clear',{worker:'lee',bounty:300,fromLv:7,toLv:8,stars:3},{freezeAtMs:1000}));const overlay=page.getByTestId('hyperframe');await expect(overlay).toBeVisible();await expect(overlay).toHaveAttribute('data-variant','clear');expect(await overlay.evaluate(el=>getComputedStyle(el).zIndex)).toBe('9999');
  await expect(page.getByTestId('hyperframe-title')).toHaveText('LEVEL UP!');for(const [type,text] of [['base','+100 P'],['bounty','+300 P'],['exp','+100 EXP']] as const)await expect(page.getByTestId(`hyperframe-reward-${type}`)).toContainText(text);await expect(page.getByTestId('hyperframe-stars')).toHaveAttribute('data-stars','3');await capture(page,'08_hyperframe_complete');
});
test('09 dark village: eight items, all village counts, reserved/sold and free states @p5',async({page},testInfo)=>{
  await bootstrap(page,{persona:'lee',theme:'dark',route:'/village'});await common(page,testInfo,'village');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await expect(itemCards(page)).toHaveCount(8);
  for(const [v,count] of [['all',8],['mapo',2],['hoehyeon',1],['banpo',1],['suseo',1],['changwon',1],['ulsan',2]] as const)await expect(page.getByTestId(`village-tab-${v}`)).toHaveAttribute('data-count',String(count));
  await expect(page.getByTestId('item-status-m2')).toHaveAttribute('data-status','reserved');await expect(page.getByTestId('item-status-m3')).toHaveAttribute('data-status','reserved');await expect(page.getByTestId('item-status-m8')).toHaveAttribute('data-status','sold');for(const id of ['m2','m6'])await expect(page.getByTestId(`item-card-${id}`)).toContainText('무료나눔');
  const grid=await itemCards(page).first().evaluate(el=>getComputedStyle(el.parentElement!).gridTemplateColumns.split(/\s+/).length);expect(grid).toBe(4);await capture(page,'09_village_market_dark');
});
test('10 orgchart: six sites, eligible employees, selected jung and private employee balances @p5',async({page},testInfo)=>{
  await bootstrap(page,{route:'/village/m1'});await common(page,testInfo,'village');await openOrg(page);await expect(page.locator('[data-testid^="org-site-"]')).toHaveCount(6);await expect(page.locator('[data-testid^="org-emp-"]')).toHaveCount(7);await page.getByTestId('org-reserve-jung').click();await expect(page.getByTestId('org-emp-jung')).toHaveAttribute('data-selected','true');
  for(const id of ['lee','oh'])for(const action of ['reserve','final'])await expect(page.getByTestId(`org-${action}-${id}`)).toBeEnabled();expect((await getDB(page)).items.find(i=>i.id==='m1')!.status).toBe('available');await page.waitForTimeout(750);await capture(page,'10_village_detail_orgchart');
});
