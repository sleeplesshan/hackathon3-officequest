import { mkdir } from 'node:fs/promises';
import { test, expect, bootstrap, FIXED_TIME, getDB, hydrated, switchPersona } from './helpers';

test('shell hydrates, exposes three player tabs and logo returns to dashboard @p2',async({page})=>{
  await bootstrap(page);
  await expect(page.getByTestId('app-root')).toBeVisible();
  await expect(page.getByTestId('gnb')).toBeVisible();
  await expect(page.getByTestId('nav-dashboard')).toBeVisible();
  await expect(page.getByTestId('nav-quests')).toBeVisible();
  await expect(page.getByTestId('nav-village')).toBeVisible();
  await expect(page.getByTestId('nav-admin')).toHaveCount(0);
  await expect(page.getByTestId('points-chip')).toContainText('1,500');
  await expect(page.getByTestId('dash-rating')).toHaveText('4.3 · 평가 23건');
  await page.goto('/quests/daily');await hydrated(page);
  await expect(page.getByText('초기화까지 09:57:12',{exact:true})).toBeVisible();
  await expect(page.getByTestId('daily-character-card')).toContainText('1,168 EXP');
  await expect(page.getByTestId('daily-character-card')).toContainText(/플래티넘.*232 EXP/);
  await page.getByTestId('gnb').getByRole('link',{name:/OFFICE QUEST/i}).click();
  await expect(page).toHaveURL(/\/$/);await expect(page.getByTestId('dash-character-card')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);await mkdir('qa/screens',{recursive:true});await page.screenshot({path:'qa/screens/p2-dashboard.png'});
});

test('player personas update dashboard and daily rights immediately without navigation, then persist @p2',async({page})=>{
  await bootstrap(page);
  let navigations=0;
  page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations++;});
  await page.getByTestId('persona-switcher').click();
  for(const id of ['kim','lee','park','ops'])await expect(page.getByTestId(`persona-option-${id}`)).toBeVisible();
  await page.getByTestId('persona-option-lee').click();
  await expect(page.getByTestId('points-chip')).toContainText('300');
  await expect(page.getByTestId('dash-level')).toContainText('7');
  await expect(page.getByTestId('dash-today-completed')).toContainText('1');
  await expect(page.getByTestId('dash-rating')).toHaveText('4.1 · 평가 8건');
  await switchPersona(page,'park');
  await expect(page.getByTestId('points-chip')).toContainText('5,200');
  await expect(page.getByTestId('dash-level')).toContainText('28');
  await expect(page.getByTestId('dash-today-completed')).toContainText('2');
  await expect(page.getByTestId('dash-rating')).toHaveText('4.7 · 평가 61건');
  await switchPersona(page,'kim');
  await expect(page.getByTestId('points-chip')).toContainText('1,500');
  await expect(page.getByTestId('dash-rating')).toHaveText('4.3 · 평가 23건');
  expect(navigations).toBe(0);
  await switchPersona(page,'lee');
  await page.reload();await hydrated(page);
  await expect(page.getByTestId('points-chip')).toContainText('300');
  await expect(page.getByTestId('dash-level')).toContainText('7');
  const db=await getDB(page);
  for(const id of ['kim','lee','park'])expect(db.daily[id]!.achieved.login).toBe(true);
});

test('operator is fourth persona, replaces points with badge, and stays out of ranking @p2',async({page})=>{
  // P2 has daily quest UI; the board becomes available at P4a.
  await bootstrap(page,{route:'/quests/daily'});
  await switchPersona(page,'ops');
  await expect(page).toHaveURL(/\/quests\/daily$/);
  await expect(page.getByTestId('admin-badge')).toContainText('운영자');
  await expect(page.getByTestId('points-chip')).toHaveCount(0);
  await expect(page.getByTestId('nav-admin')).toBeVisible();
  expect(await page.locator('[data-testid^="ranking-row-"][data-user="ops"]').count()).toBe(0);
  await switchPersona(page,'kim');
  await expect(page.getByTestId('nav-admin')).toHaveCount(0);
  await expect(page.getByTestId('points-chip')).toContainText('1,500');
  await page.getByTestId('gnb').getByRole('link',{name:/OFFICE QUEST/i}).click();
  const ranking=page.locator('[data-testid^="ranking-row-"]');
  await expect(ranking).toHaveCount(5);
  expect(await ranking.evaluateAll(rows=>rows.map(row=>row.getAttribute('data-user')))).toEqual(['park','choi','jung','kim','lee']);
});

test('theme toggle updates html and survives reload together with persona @p2',async({page})=>{
  await bootstrap(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await switchPersona(page,'lee');
  await page.getByTestId('theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  let releaseScripts!:()=>void;const heldScripts=new Promise<void>(resolve=>{releaseScripts=resolve;});
  await page.route('**/_next/static/**/*.js',async route=>{await heldScripts;await route.continue();});
  await page.reload({waitUntil:'commit'});
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(page.getByTestId('skeleton')).toBeVisible();
  releaseScripts();await page.unrouteAll({behavior:'wait'});
  await hydrated(page);await expect(page.getByTestId('points-chip')).toContainText('300');
  await page.getByTestId('theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

test('D27 persona and theme remain independent in already-open tabs @p2',async({page,context})=>{
  await bootstrap(page);
  const other=await context.newPage(),errors:string[]=[];
  other.on('pageerror',error=>errors.push(error.message));other.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await bootstrap(other,{fresh:false});
  await switchPersona(page,'lee');await page.getByTestId('theme-toggle').click();
  await expect(page.getByTestId('points-chip')).toContainText('300');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(other.getByTestId('points-chip')).toContainText('1,500');await expect(other.locator('html')).toHaveAttribute('data-theme','light');
  await other.getByTestId('timer-ctl-toggle').click();
  await expect(page.getByTestId('timer-display')).toHaveText('00:00:00');
  expect(errors).toEqual([]);await other.close();
});

test('timer toggle consumes and resets session; plus30 and explicit controls stay bounded @p2',async({page})=>{
  await bootstrap(page);
  await expect(page.getByTestId('timer-display')).toHaveText('02:00:00');
  await page.getByTestId('timer-ctl-toggle').click();await expect(page.getByTestId('timer-display')).toHaveText('00:00:00');
  await page.getByTestId('timer-ctl-toggle').click();await expect(page.getByTestId('timer-display')).toHaveText('02:00:00');
  await page.getByTestId('timer-ctl-expire').click();await expect(page.getByTestId('timer-display')).toHaveText('00:00:00');
  await page.getByTestId('timer-ctl-plus30').click();await expect(page.getByTestId('timer-display')).toHaveText('00:30:00');
  await page.getByTestId('timer-ctl-reset').click();await expect(page.getByTestId('timer-display')).toHaveText('02:00:00');
  await page.getByTestId('timer-ctl-plus30').click();await expect(page.getByTestId('timer-display')).toHaveText('02:00:00');
});

test('timer decreases by three seconds under an advancing browser clock @p2',async({page})=>{
  await page.clock.install({time:new Date(FIXED_TIME)});
  await bootstrap(page,{fixedTime:null});
  await expect(page.getByTestId('timer-display')).toHaveText('02:00:00');
  await page.clock.runFor(3000);
  await expect(page.getByTestId('timer-display')).toHaveText(/^01:59:5[6-8]$/);
});

test('dashboard folds to two columns at 1200px without horizontal overflow @p2',async({page})=>{
  await page.setViewportSize({width:1200,height:900});await bootstrap(page);
  const geometry=await page.getByTestId('dash-character-card').evaluate(card=>{
    let ancestor=card.parentElement;
    while(ancestor&&!ancestor.querySelector('[data-testid="dash-daily-card"]'))ancestor=ancestor.parentElement;
    const root=document.documentElement,body=document.body;
    return {display:ancestor?getComputedStyle(ancestor).display:null,columns:ancestor?getComputedStyle(ancestor).gridTemplateColumns.split(/\s+/).filter(Boolean):[],scrollWidth:Math.max(root.scrollWidth,body.scrollWidth),viewport:innerWidth};
  });
  expect(geometry.display).toBe('grid');expect(geometry.columns).toHaveLength(2);expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport);
  await page.evaluate(()=>document.fonts.ready);await mkdir('qa/screens',{recursive:true});await page.screenshot({path:'qa/screens/p2-dashboard-1200.png',fullPage:true});
});
