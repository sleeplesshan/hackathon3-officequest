import { mkdir, writeFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
import { test, expect, bootstrap, agreePledge, expectHyperFrame, getDB, hydrated, switchPersona } from './helpers';
import { prepareQuest } from './quest-helpers';

async function watchChange(page:Page,selector:string,text?:string){
  await page.evaluate(({selector,text})=>{
    delete document.documentElement.dataset.syncObservedAt;
    const observer=new MutationObserver(()=>{const target=document.querySelector(selector);if(target&&(!text||target.textContent?.includes(text))){document.documentElement.dataset.syncObservedAt=String(performance.timeOrigin+performance.now());observer.disconnect();}});
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  },{selector,text});
}
async function markClick(page:Page,testId:string){await page.getByTestId(testId).evaluate(el=>el.addEventListener('click',()=>{document.documentElement.dataset.syncStartedAt=String(performance.timeOrigin+performance.now());},{capture:true,once:true}));}
async function latency(a:Page,b:Page){const start=await a.evaluate(()=>Number(document.documentElement.dataset.syncStartedAt)),end=await b.evaluate(()=>Number(document.documentElement.dataset.syncObservedAt));expect(start).toBeGreaterThan(0);expect(end).toBeGreaterThanOrEqual(start);expect(end-start).toBeLessThanOrEqual(300);return end-start;}

for(const transport of ['broadcast','storage'] as const)test(`${transport} synchronization propagates likes and new quest within 300ms and persists on reload @p5`,async({page,context})=>{
  if(transport==='storage')await context.addInitScript(()=>Object.defineProperty(window,'BroadcastChannel',{value:undefined,writable:true,configurable:true}));
  await bootstrap(page,{route:'/village'});const other=await context.newPage(),errors:string[]=[];other.on('pageerror',e=>errors.push(e.message));other.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await bootstrap(other,{fresh:false,route:'/village'});
  const before=(await getDB(page)).items.find(i=>i.id==='m1')!.likeCount;await watchChange(other,'[data-testid="item-like-count-m1"]',String(before+1));await markClick(page,'item-like-m1');await page.getByTestId('item-like-m1').click();await expect(other.getByTestId('item-like-count-m1')).toContainText(String(before+1));const likeMs=await latency(page,other);
  await other.goto('/quests/board');await hydrated(other);await page.goto('/quests/new');await hydrated(page);await prepareQuest(page,{title:`동기화 검증 ${transport}`,bounty:0});await page.getByTestId('quest-submit').click();await agreePledge(page);await watchChange(other,'[data-testid="board-row-8"]');await markClick(page,'pledge-confirm');await page.getByTestId('pledge-confirm').click();await expect(other.getByTestId('board-row-8')).toContainText(`동기화 검증 ${transport}`);const createMs=await latency(page,other);await expectHyperFrame(page,'post');
  await other.reload();await hydrated(other);await expect(other.getByTestId('board-row-8')).toBeVisible();expect((await getDB(other)).items.find(i=>i.id==='m1')!.likeCount).toBe(before+1);await mkdir('qa/performance',{recursive:true});await writeFile(`qa/performance/sync-${transport}.json`,JSON.stringify({likeMs,createMs},null,2));expect(errors).toEqual([]);await other.close();
});

test('malformed and mismatched stored DB reseed with toast, preserving saved persona and theme @p5',async({page})=>{
  await bootstrap(page,{route:'/village'});await switchPersona(page,'lee');await page.getByTestId('theme-toggle').click();
  for(const broken of ['{"schemaVersion":2}','{']){
    await page.evaluate(value=>localStorage.setItem('oq:v1:db',value),broken);await page.reload();await hydrated(page);await expect(page.getByTestId('toast')).toContainText('저장한 데이터를 읽지 못해 초기화했어요');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await expect(page.getByTestId('points-chip')).toContainText('300');const db=await getDB(page);expect(db.quests).toHaveLength(7);expect(db.items).toHaveLength(8);expect(db.users.kim!.points).toBe(1500);
  }
});
