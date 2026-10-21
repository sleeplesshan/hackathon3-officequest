import { test, expect, bootstrap, getDB, switchPersona } from './helpers';

test('dashboard seeded status, ranking, daily progress and season progress match PRD @p3',async({page})=>{
  await bootstrap(page);
  await expect(page.getByTestId('dash-level')).toContainText('12');
  await expect(page.getByTestId('dash-exp-bar')).toHaveAttribute('aria-valuenow','68');
  await expect(page.getByTestId('dash-points')).toContainText('1,500');
  await expect(page.getByTestId('dash-today-completed')).toContainText(/0\s*\/\s*2/);
  await expect(page.getByTestId('dash-completed-total')).toContainText('23');
  await expect(page.getByTestId('dash-season-dday')).toContainText('D-14');
  await expect(page.getByTestId('dash-daily-ring')).toContainText(/1\s*\/\s*4/);
  await expect(page.getByTestId('dash-season-label')).toHaveText('2026 Season 1');
  await expect(page.getByTestId('dash-character-card').locator('[data-testid="pixel-sprite"][data-tier="gold"]')).toBeVisible();
  await expect(page.getByText(/진행률 78%/)).toBeVisible();
  const rows=page.locator('[data-testid^="ranking-row-"]');
  expect(await rows.evaluateAll(els=>els.map(el=>el.getAttribute('data-user')))).toEqual(['park','choi','jung','kim','lee']);
  for(const [index,exp] of ['2,740','2,360','1,850','1,168','650'].entries())await expect(rows.nth(index)).toContainText(exp);
});

test('season reset confirmation preserves points and records, awards old badge, renders bronze @p3',async({page})=>{
  await bootstrap(page);const before=await getDB(page);
  await expect(page.getByTestId('dash-character-card').locator('.oq-tier-aura')).toHaveAttribute('data-tier','gold');
  await page.getByTestId('season-reset-btn').click();await expect(page.getByTestId('confirm-modal')).toBeVisible();
  await page.getByTestId('confirm-ok').click();
  await expect(page.getByTestId('dash-season-label')).toHaveText('2026 Season 2');
  await expect(page.getByTestId('dash-level')).toContainText('1');
  await expect(page.getByTestId('dash-exp-bar')).toHaveAttribute('aria-valuenow','0');
  await expect(page.getByTestId('dash-points')).toContainText('1,500');
  await expect(page.getByTestId('dash-character-card').locator('[data-testid="pixel-sprite"][data-tier="bronze"]')).toBeVisible();
  await expect(page.getByTestId('dash-character-card').locator('.oq-tier-aura')).toHaveAttribute('data-tier','bronze');
  await expect(page.getByTestId('toast')).toContainText('포인트는 100% 유지돼요');
  const after=await getDB(page);
  for(const [id,user] of Object.entries(after.users)){
    expect(user.exp).toBe(0);expect(user.points).toBe(before.users[id]!.points);expect(user.completedTotal).toBe(before.users[id]!.completedTotal);expect(user.rating).toEqual(before.users[id]!.rating);expect(user.seasonBadges).toContain('2026 Season 1');
  }
  expect(after.quests).toEqual(before.quests);expect(after.items).toEqual(before.items);expect(after.transactions).toEqual(before.transactions);expect(after.ratings).toEqual(before.ratings);
  await switchPersona(page,'lee');await expect(page.getByTestId('points-chip')).toContainText('300');await expect(page.getByTestId('dash-level')).toContainText('1');
});
