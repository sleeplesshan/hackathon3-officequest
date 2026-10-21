import { expect, test as base, type Page } from '@playwright/test';
import type { DB, PersonaId } from '../../src/lib/types';
import type {} from '../../src/lib/test-hooks';
export { expect };
export const FIXED_TIME = '2026-10-21T14:02:48+09:00';
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await use(errors);
    expect(errors, 'browser console and page errors').toEqual([]);
  }, { auto: true }],
});
export async function bootstrap(page: Page, options: { persona?: PersonaId; theme?: 'light' | 'dark'; fixedTime?: string | null; fresh?: boolean; route?: string } = {}) {
  const { persona = 'kim', theme = 'light', fixedTime = FIXED_TIME, fresh = true, route = '/' } = options;
  if (fresh) await page.addInitScript(({ persona, theme }) => {
    if (!localStorage.getItem('oq:booted')) {
      localStorage.clear(); localStorage.setItem('oq:booted', '1'); localStorage.setItem('oq:test', '1');
      localStorage.setItem('oq:v1:ui', JSON.stringify({ personaId: persona, theme }));
    }
  }, { persona, theme });
  if (fixedTime) await page.clock.setFixedTime(new Date(fixedTime));
  await page.goto(route); await hydrated(page);
}
export async function hydrated(page: Page) { await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true'); }
export async function switchPersona(page: Page, id: PersonaId) {
  await page.getByTestId('persona-switcher').click(); await page.getByTestId(`persona-option-${id}`).click();
  await expect(page.getByTestId(id === 'ops' ? 'admin-badge' : 'points-chip')).toBeVisible();
}
export async function getDB(page: Page): Promise<DB> { return page.evaluate(() => window.__OQ_TEST__!.getDB()); }
export async function scenario(page: Page, name: 'seed' | 'ref07' | 'timerExpired' | 'limitApprove' | 'rejectLimit') {
  await page.evaluate(name => window.__OQ_TEST__!.loadScenario(name), name);
}
export async function fillEditor(page: Page, testId: string, html: string) {
  await expect.poll(() => page.evaluate(id => Boolean(window.__OQ_EDITORS__?.[id]), testId)).toBe(true);
  await page.evaluate(({ testId, html }) => window.__OQ_EDITORS__![testId]!.setContent(html), { testId, html });
}
export async function agreePledge(page: Page) {
  for (const n of [1, 2, 3]) await page.getByTestId(`pledge-check-${n}`).check();
}
export async function expectHyperFrame(page: Page, variant: 'post' | 'clear') {
  const started = Date.now();
  const overlay = page.getByTestId('hyperframe');
  await expect(overlay).toBeVisible(); await expect(overlay).toHaveAttribute('data-variant', variant);
  await expect(overlay).toBeHidden({ timeout: 4000 });
  expect(Date.now() - started).toBeLessThanOrEqual(2400);
  const record = await page.evaluate(() => window.__OQ_TEST__!.hyperframes.at(-1));
  expect(record?.closedAt).not.toBeNull();
  expect(record!.closedAt! - record!.openedAt).toBeGreaterThanOrEqual(1650);
  expect(record!.closedAt! - record!.openedAt).toBeLessThanOrEqual(1950);
}
export async function approveWithStars(page: Page, stars: 1 | 2 | 3 | 4 | 5) {
  await page.getByTestId('approve-btn').click(); await page.getByTestId(`rating-star-${stars}`).click();
  await page.getByTestId('rating-confirm').click(); await expectHyperFrame(page, 'clear');
}
