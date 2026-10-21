import { test, expect, bootstrap, getDB, hydrated } from './helpers';
import type { Page } from '@playwright/test';

const rows=(page:Page)=>page.locator('tr[data-testid^="board-row-"]');
async function numbers(page:Page){return rows(page).evaluateAll(elements=>elements.map(el=>Number(el.getAttribute('data-testid')!.replace('board-row-',''))));}
test('seed board shows seven rows, canonical order, counts, state badge and exact data @p4a',async({page})=>{
  await bootstrap(page,{route:'/quests/board'});await expect(rows(page)).toHaveCount(7);await expect.poll(()=>numbers(page)).toEqual([7,6,5,4,3,2,1]);
  for(const [id,count] of [['type-all',7],['type-inquiry',3],['type-request',4],['status-recruiting',3],['status-in_progress',2],['status-revision',1],['status-done',2]])await expect(page.getByTestId(`board-filter-${id}`)).toContainText(String(count));
  await expect(page.getByTestId('board-row-7')).toContainText('3분기 원가 분석 엑셀 매크로 요청');await expect(page.getByTestId('board-row-7')).toContainText('300');await expect(page.getByTestId('board-row-applicants-7')).toContainText('3');await expect(page.getByTestId('board-row-views-7')).toHaveText('128');await expect(page.getByTestId('board-row-status-4')).toHaveText('진행중 · 보완요청');
});
test('in-progress includes revisions; status filters and cross-filter counts use remaining filters @p4a',async({page})=>{
  await bootstrap(page,{route:'/quests/board'});await page.getByTestId('board-filter-status-in_progress').click();await expect.poll(()=>numbers(page)).toEqual([5,4]);
  await page.getByTestId('board-filter-status-revision').click();await expect.poll(()=>numbers(page)).toEqual([4]);
  await page.getByTestId('board-filter-status-recruiting').click();await expect.poll(()=>numbers(page)).toEqual([7,6,3]);
  await expect(page.getByTestId('board-filter-type-all')).toContainText('3');await expect(page.getByTestId('board-filter-type-inquiry')).toContainText('2');await expect(page.getByTestId('board-filter-type-request')).toContainText('1');
  await page.getByTestId('board-filter-type-request').click();await expect.poll(()=>numbers(page)).toEqual([7]);await expect(page.getByTestId('board-filter-status-recruiting')).toContainText('1');await expect(page.getByTestId('board-filter-status-done')).toContainText('1');await expect(page.getByTestId('board-filter-status-in_progress')).toContainText('2');
});
test('combined type/status/search serializes URL and survives reload; queries match title requester and dept @p4a',async({page})=>{
  await bootstrap(page,{route:'/quests/board'});await page.getByTestId('board-filter-type-inquiry').click();await page.getByTestId('board-filter-status-recruiting').click();await page.getByTestId('board-search').fill('법인카드');
  await expect(rows(page)).toHaveCount(1);await expect.poll(()=>numbers(page)).toEqual([6]);
  await expect.poll(()=>new URL(page.url()).searchParams.get('q')).toBe('법인카드');expect(new URL(page.url()).searchParams.get('type')).toBe('inquiry');expect(new URL(page.url()).searchParams.get('status')).toBe('recruiting');
  await page.reload();await hydrated(page);await expect(page.getByTestId('board-search')).toHaveValue('법인카드');await expect.poll(()=>numbers(page)).toEqual([6]);
  await page.goto('/quests/board?q='+encodeURIComponent('김효성'));await hydrated(page);await expect.poll(()=>numbers(page)).toEqual([7]);
  await page.goto('/quests/board?q='+encodeURIComponent('생산기술팀'));await hydrated(page);await expect.poll(()=>numbers(page)).toEqual([6,4]);
});
test('board sorts by reward, views and newest; mine filters follow current persona @p4a',async({page})=>{
  await bootstrap(page,{route:'/quests/board'});await page.getByTestId('board-sort').selectOption('reward');await expect.poll(()=>numbers(page)).toEqual([5,4,7,1,3,2,6]);await page.getByTestId('board-sort').selectOption('views');await expect.poll(()=>numbers(page)).toEqual([1,5,4,7,2,6,3]);await page.getByTestId('board-sort').selectOption('newest');await expect.poll(()=>numbers(page)).toEqual([7,6,5,4,3,2,1]);
  for(const [mine,expected] of [['requested',[7]],['applied',[2]],['done',[2]]] as const){await page.goto(`/quests/board?mine=${mine}`);await hydrated(page);await expect.poll(()=>numbers(page)).toEqual(expected);}
});
test('row navigation opens quest detail and increments views once, reflected on return @p4b',async({page})=>{
  await bootstrap(page,{route:'/quests/board'});const before=(await getDB(page)).quests.find(q=>q.no===7)!.views;await page.getByTestId('board-row-7').click();await expect(page).toHaveURL(/\/quests\/7$/);await expect(page.getByTestId('quest-detail')).toBeVisible();await expect.poll(async()=>(await getDB(page)).quests.find(q=>q.no===7)!.views).toBe(before+1);await page.goto('/quests/board');await hydrated(page);await expect(page.getByTestId('board-row-views-7')).toHaveText(String(before+1));
});
