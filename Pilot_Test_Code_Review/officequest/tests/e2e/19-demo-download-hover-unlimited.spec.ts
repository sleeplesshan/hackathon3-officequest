import { test, expect, bootstrap, fillEditor, getDB, hydrated, switchPersona, FIXED_TIME, agreePledge, expectHyperFrame } from './helpers';
import { openOrg } from './market-helpers';
import { prepareQuest } from './quest-helpers';

test('demo attachments show a short fading download notice without navigation, popup, download or external requests',async({page,context})=>{
  const external:string[]=[],popups:string[]=[],downloads:string[]=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).hostname!=='localhost')external.push(r.url());});
  page.on('popup',p=>popups.push(p.url()));page.on('download',d=>downloads.push(d.suggestedFilename()));
  await bootstrap(page,{route:'/quests/7'});const badge=page.getByTestId('sharepoint-badge');const button=badge.getByRole('button',{name:'Q3_원가분석_원본.xlsx',exact:true});
  await expect(badge.locator('a')).toHaveCount(0);await expect(badge).not.toHaveAttribute('data-url',/.+/);
  await button.click();const notice=page.getByTestId('demo-download-notice');await expect(notice).toHaveText('다운로드 중');await expect(notice).toHaveCSS('animation-name','demo-download-fade');
  await expect(notice).toBeHidden({timeout:3000});await expect(page).toHaveURL(/\/quests\/7$/);
  await button.focus();await page.keyboard.press('Enter');await expect(notice).toBeVisible();await expect(notice).toBeHidden({timeout:3000});
  expect(context.pages()).toHaveLength(1);expect(popups).toEqual([]);expect(downloads).toEqual([]);expect(external).toEqual([]);
  expect((await getDB(page)).quests.flatMap(q=>q.attachments).filter(f=>f.kind==='sharepoint').every(f=>f.url===undefined)).toBe(true);
});

test('repeated attachment clicks restart one notice and legacy saved external URLs are stripped on reload',async({page})=>{
  await page.clock.install({time:new Date(FIXED_TIME)});await bootstrap(page,{fixedTime:null,route:'/quests/7'});
  const button=page.getByTestId('demo-attachment-download');await button.click();await page.clock.runFor(900);await button.click();await page.clock.runFor(700);
  await expect(page.getByTestId('demo-download-notice')).toHaveCount(1);await page.clock.runFor(800);await expect(page.getByTestId('demo-download-notice')).toHaveCount(0);
  await page.evaluate(()=>{const db=JSON.parse(localStorage.getItem('oq:v1:db')!);db.quests.find((q:{no:number})=>q.no===7).attachments[0].url='https://hyosung.sharepoint.com/old.xlsx';localStorage.setItem('oq:v1:db',JSON.stringify(db));});
  await page.reload();await hydrated(page);expect((await getDB(page)).quests.find(q=>q.no===7)!.attachments[0]!.url).toBeUndefined();await expect(page.getByTestId('sharepoint-badge').locator('a[href]')).toHaveCount(0);
});

test('hover sound covers top navigation, listing entry/submit and both org designation buttons; mute and disabled state suppress it',async({page})=>{
  await page.addInitScript(()=>{const w=window as unknown as Window&{hoverSounds:{cue:string;played:boolean;activeVoices:number}[]};w.hoverSounds=[];window.addEventListener('oq:sound',e=>w.hoverSounds.push((e as CustomEvent).detail));});
  const played=()=>page.evaluate(()=>(window as unknown as Window&{hoverSounds:{cue:string;played:boolean}[]}).hoverSounds.filter(s=>s.cue==='hover'&&s.played).length);
  await bootstrap(page);await page.getByTestId('nav-dashboard').hover();expect(await played()).toBe(0);
  await page.getByTestId('timer-display').click();
  async function hover(testId:string){await page.mouse.move(2,200);await page.waitForTimeout(140);const before=await played();await page.getByTestId(testId).hover();await expect.poll(played).toBeGreaterThan(before);}
  await hover('nav-dashboard');await hover('nav-quests');await hover('nav-village');await page.getByTestId('nav-village').click();await hover('village-new-btn');
  await page.getByTestId('village-new-btn').click();await hover('item-submit');
  await page.goto('/village/m1');await hydrated(page);await openOrg(page);await hover('org-reserve-lee');await hover('org-final-lee');await page.getByTestId('org-cancel').click();
  await page.getByTestId('sound-toggle').click();const muted=await played();await page.mouse.move(2,200);await page.waitForTimeout(140);await page.getByTestId('nav-quests').hover();expect(await played()).toBe(muted);
  await page.getByTestId('sound-toggle').click();await switchPersona(page,'ops');await expect(page.getByTestId('village-new-btn')).toBeDisabled();const disabled=await played();await page.mouse.move(2,200);await page.waitForTimeout(140);await page.getByTestId('village-new-btn').hover({force:true});expect(await played()).toBe(disabled);
  expect(await page.evaluate(()=>(window as unknown as Window&{hoverSounds:{activeVoices:number}[]}).hoverSounds.every(s=>s.activeVoices<=16))).toBe(true);
});

test('inquiry accepts repeated answers within remaining time even after two completed rewards, and stops when time expires',async({page})=>{
  await bootstrap(page,{persona:'park',route:'/quests/3'});const before=(await getDB(page)).users.park!;expect(before.completedToday).toBe(2);
  for(let i=0;i<5;i++){await fillEditor(page,'inquiry-answer-editor',`<p>공유 권한에 대한 추가 답변 ${i}: 관리자 설정에서 권한을 확인해 주세요.</p>`);await expect(page.getByTestId('inquiry-answer-submit')).toBeEnabled();await page.getByTestId('inquiry-answer-submit').click();await expect(page.locator('.inquiry-answer')).toHaveCount(i+1);}
  expect((await getDB(page)).users.park).toEqual(before);await page.getByTestId('timer-ctl-expire').click();await expect(page.getByTestId('inquiry-answer-submit')).toBeDisabled();
});


test('quest registration entry, submit and pledge confirmation hover sounds respect mute and disabled states; successful posting sounds once',async({page})=>{
  await page.addInitScript(()=>{const w=window as unknown as Window&{questSounds:{cue:string;played:boolean}[]};w.questSounds=[];window.addEventListener('oq:sound',e=>w.questSounds.push((e as CustomEvent).detail));});
  const played=(cue='hover')=>page.evaluate(cue=>(window as unknown as Window&{questSounds:{cue:string;played:boolean}[]}).questSounds.filter(s=>s.cue===cue&&s.played).length,cue);
  async function hover(id:string,enabled=true){await page.mouse.move(2,200);await page.waitForTimeout(140);const before=await played();await page.getByTestId(id).hover({force:!enabled});if(enabled)await expect.poll(()=>played()).toBeGreaterThan(before);else expect(await played()).toBe(before);}
  await bootstrap(page,{route:'/quests/board'});await page.getByTestId('timer-display').click();await hover('side-quest-new');await hover('board-new-btn');
  await page.getByTestId('board-new-btn').click();await prepareQuest(page);await hover('quest-submit');
  await page.getByTestId('sound-toggle').click();await hover('quest-submit',false);await page.getByTestId('sound-toggle').click();
  await page.getByTestId('quest-submit').click();await expect(page.getByTestId('pledge-confirm')).toBeDisabled();await hover('pledge-confirm',false);
  await agreePledge(page);await hover('pledge-confirm');const before=await played('success');await page.getByTestId('pledge-confirm').click();await expectHyperFrame(page,'post');expect(await played('success')).toBe(before+1);
  await page.getByTestId('timer-ctl-expire').click();await page.getByTestId('side-quest-new').click();await expect(page.getByTestId('quest-submit')).toBeDisabled();await hover('quest-submit',false);
});
