import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { test as appTest, bootstrap, getDB, hydrated } from './helpers';

// P0 게이트용. P2 이후에도 계속 유효해야 하므로 "Hello" 문구가 아니라 app-root만 단언한다.
test('P0 root responds 200 and renders app-root @p0', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.getByTestId('app-root')).toBeVisible();
});

appTest('dashboard hydration SHOULD timing is observed from navigation before application scripts @p6', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      if (document.documentElement?.dataset.hydrated === 'true') {
        performance.mark('oq:dashboard-hydrated'); observer.disconnect();
      }
    });
    observer.observe(document, { subtree: true, attributes: true, attributeFilter: ['data-hydrated'] });
  });
  // Playwright's mocked clock empties Performance entry APIs, so this SHOULD
  // measurement intentionally uses the browser's native clock.
  await bootstrap(page, { fixedTime: null });
  const timing = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const hydrated = performance.getEntriesByName('oq:dashboard-hydrated')[0]!;
    return { navigationStartMs: navigation.startTime, responseEndMs: navigation.responseEnd,
      hydratedAtMs: hydrated.startTime, hydrationMs: hydrated.startTime - navigation.startTime,
      shouldThresholdMs: 1000, clock: 'native browser performance; Date unmocked', browser: navigator.userAgent };
  });
  expect(Number.isFinite(timing.hydrationMs)).toBe(true); expect(timing.hydrationMs).toBeGreaterThanOrEqual(0);
  await mkdir('qa/performance', { recursive: true });
  await writeFile('qa/performance/dashboard-hydration.json', JSON.stringify({ ...timing, meetsShould: timing.hydrationMs <= 1000 }, null, 2));
  await testInfo.attach('dashboard-hydration', { body: JSON.stringify(timing), contentType: 'application/json' });
});

appTest('pre-hydration skeleton preserves the dashboard four-card geometry @p6', async ({ page, browser }) => {
  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const before = await staticContext.newPage(); await before.goto('/');
  await expect(before.getByTestId('skeleton')).toBeVisible(); await expect(before.locator('html')).not.toHaveAttribute('data-hydrated', 'true');
  const skeleton = await before.getByTestId('skeleton').locator(':scope > div').evaluateAll(elements => elements.map(element => {
    const bounds = element.getBoundingClientRect(); return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
  }));
  await staticContext.close(); await bootstrap(page);
  const cards = await page.locator('.bento > .card').evaluateAll(elements => elements.map(element => {
    const bounds = element.getBoundingClientRect(); return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
  }));
  expect(skeleton).toHaveLength(4); expect(cards).toHaveLength(4);
  for (let i = 0; i < 4; i++) for (const coordinate of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(skeleton[i]![coordinate] - cards[i]![coordinate]), `card${i} ${coordinate}`).toBeLessThanOrEqual(2);
});

appTest('all player routes respond200, hydrate, load fonts and avoid missing or external runtime resources @p5',async({page})=>{
  const missing:string[]=[],external:string[]=[],tinyCloud:string[]=[];
  page.on('response',response=>{if(response.status()===404)missing.push(response.url());});
  page.on('request',request=>{if(request.url().includes('tiny.cloud'))tinyCloud.push(request.url());if(['image','script','font'].includes(request.resourceType())&&/^https?:/.test(request.url())&&new URL(request.url()).hostname!=='localhost')external.push(request.url());});
  await bootstrap(page);
  for(const route of ['/','/quests','/quests/daily','/quests/new','/quests/board','/quests/7','/quests/7/edit','/village','/village/new','/village/m1','/village/m1/edit']){
    const response=await page.goto(route);expect(response?.status(),route).toBe(200);await hydrated(page);await expect(page.getByTestId('app-root')).toBeVisible();
    for(const id of ['quest-body-editor','item-body-editor'])if(await page.getByTestId(id).count())await expect.poll(()=>page.evaluate(id=>Boolean(window.__OQ_EDITORS__?.[id]),id)).toBe(true);
  }
  await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.fonts.check('800 16px Paperlogy'))).toBe(true);const db=await getDB(page);expect(db.quests).toHaveLength(7);expect(db.items).toHaveLength(8);expect(missing).toEqual([]);expect(external).toEqual([]);expect(tinyCloud).toEqual([]);
});
