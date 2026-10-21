import type { Page } from '@playwright/test';
import { test, expect, bootstrap, FIXED_TIME, fillEditor, getDB, hydrated, switchPersona } from './helpers';
import { openOrg, designateFinal } from './market-helpers';
import type { RestrictionDuration, RestrictionKind } from '../../src/lib/types';

const FLAGS = ['fast_high_bounty__A-107', 'reciprocal__han__jung', 'market_pair__choi__jung', 'pair_5star__choi__kang'] as const;
const POST_REASON = '반복 등록 내역을 확인하는 동안 등록을 제한합니다';
const KIM_REASON = '이용 내역 소명 확인을 위해 등록과 구매를 제한합니다';
const disabledReason = (page: Page, id: string) => page.locator(`[data-testid="disabled-reason"][data-for="${id}"]`);

async function actionInViewport(page: Page, id: string) {
  const button = page.getByTestId(id), bounds = await button.boundingBox();
  await expect(button).toBeVisible(); expect(bounds, `${id} has a rendered box`).not.toBeNull();
  expect(bounds!.x, `${id} left edge`).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width, `${id} right edge before automatic scrolling`).toBeLessThanOrEqual(page.viewportSize()!.width);
}

async function adminTab(page: Page, tab: 'flags' | 'restrictions' | 'log') {
  await page.getByTestId(`admin-tab-${tab}`).click();
  await expect(page).toHaveURL(new RegExp(`/admin\\?tab=${tab}$`));
}

async function fillRestriction(page: Page, user: string, kinds: RestrictionKind[], duration: RestrictionDuration, reason: string) {
  await expect(page.getByTestId('restrict-modal')).toBeVisible();
  await expect(page.getByTestId('restrict-duration-3d')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('restrict-reason-input')).toHaveAttribute('maxlength', '100');
  await page.getByTestId('restrict-user-select').selectOption(user);
  for (const kind of ['quest_post', 'purchase'] as const) await page.getByTestId(`restrict-kind-${kind}`).setChecked(kinds.includes(kind));
  await page.getByTestId(`restrict-duration-${duration}`).click();
  await page.getByTestId('restrict-reason-input').fill(reason);
  await expect(page.getByTestId('restrict-confirm')).toBeEnabled();
}

async function createRestriction(page: Page, user: string, kinds: RestrictionKind[], duration: RestrictionDuration, reason: string) {
  await page.getByTestId('restrict-new-btn').click();
  expect(await page.getByTestId('restrict-user-select').locator('option').evaluateAll(options => options.map(option => option.getAttribute('value')))).toEqual(['kim', 'lee', 'park', 'choi', 'jung', 'han', 'kang', 'oh']);
  await fillRestriction(page, user, kinds, duration, reason);
  await page.getByTestId('restrict-confirm').click();
  await expect(page.getByTestId('restrict-modal')).toBeHidden();
}

async function lift(page: Page, id: string) {
  await page.getByTestId(`restriction-lift-btn-${id}`).click();
  await expect(page.getByTestId('lift-modal')).toBeVisible();
  await expect(page.getByTestId('lift-confirm')).toBeDisabled();
  await page.getByTestId('lift-reason-input').fill('소명 확인이 완료되어 제한을 해제합니다');
  await page.getByTestId('lift-confirm').click();
  await expect(page.getByTestId(`restriction-row-${id}`)).toHaveAttribute('data-status', 'lifted');
}

test('admin access is 200 with a forbidden panel for players; operator root redirects and seed flags expose all evidence in canonical order @p5b', async ({ page }) => {
  await bootstrap(page, { route: '/admin' });
  expect((await page.goto('/admin'))?.status()).toBe(200); await hydrated(page);
  await expect(page.getByTestId('admin-forbidden')).toContainText('운영자만 볼 수 있어요');
  await expect(page.getByTestId('admin-page')).toHaveCount(0); await expect(page.getByTestId('nav-admin')).toHaveCount(0);
  await page.getByTestId('admin-forbidden').getByRole('link', { name: '대시보드로' }).click(); await expect(page).toHaveURL(/\/$/);
  await switchPersona(page, 'ops'); await expect(page).toHaveURL(/\/admin(?:\?tab=flags)?$/);
  await expect(page.getByTestId('nav-admin')).toBeVisible(); await expect(page.getByTestId('admin-badge')).toBeVisible();
  await expect(page.getByTestId('points-chip')).toHaveCount(0); await expect(page.getByTestId('restriction-banner')).toHaveCount(0);
  await expect(page.getByTestId('admin-stale-seed')).toHaveCount(0); await expect(page.getByTestId('admin-flag-count')).toContainText('4');
  const rows = page.locator('[data-testid^="flag-row-"]'); await expect(rows).toHaveCount(4);
  expect(await rows.evaluateAll(elements => elements.map(el => el.getAttribute('data-testid')!.replace('flag-row-', '')))).toEqual([...FLAGS]);
  for (const id of FLAGS) for (const action of ['restrict', 'dismiss']) await actionInViewport(page, `flag-${action}-btn-${id}`);
  for (const [index, id] of FLAGS.entries()) {
    const row = page.getByTestId(`flag-row-${id}`); await expect(row).toHaveAttribute('data-status', 'open');
    await expect(row).toHaveAttribute('data-severity', index < 2 ? 'high' : 'medium');
    await row.getByRole('button', { expanded: false }).click(); const evidence = page.getByTestId(`flag-evidence-${id}`); await expect(evidence).toBeVisible(); await expect(evidence.locator('li')).toHaveCount([1, 4, 3, 3][index]!);
  }
  await expect(page.getByTestId(`flag-row-${FLAGS[3]}`)).toHaveAttribute('data-also', 'pair_repeat');
  await expect(page.getByTestId(`flag-row-${FLAGS[3]}`)).toContainText('반복 완료');
  await adminTab(page, 'restrictions'); await expect(page.getByTestId('restriction-row-r1')).toHaveAttribute('data-status', 'lifted');
  await expect(page.getByTestId('restriction-lift-btn-r1')).toHaveCount(0);
  await adminTab(page, 'log'); await expect(page.getByTestId('admin-log-row')).toHaveCount(2);
  await page.reload(); await hydrated(page); await expect(page).toHaveURL(/\/admin\?tab=log$/); await expect(page.getByTestId('admin-log-row')).toHaveCount(2);
});

test('canonical moderation: kang seven-day r2, kim combined three-day r3/r4, precise player guards, cross-tab purchase lift and append-only audit @p5b', async ({ page, context }) => {
  await bootstrap(page,{persona:'lee',route:'/village/m4'});await designateFinal(page,'kim');await switchPersona(page,'ops');await page.goto('/admin');await hydrated(page);const initial=await getDB(page);
  await page.getByTestId(`flag-restrict-btn-${FLAGS[3]}`).click();
  await expect(page.getByTestId('restrict-user-select')).toHaveValue('choi');
  expect(await page.getByTestId('restrict-user-select').locator('option').evaluateAll(options => options.map(option => option.getAttribute('value')))).toEqual(['choi', 'kang']);
  await fillRestriction(page, 'kang', ['quest_post'], '7d', POST_REASON);
  await page.getByTestId('restrict-reason-input').fill('사유네자'); await expect(page.getByTestId('restrict-confirm')).toBeDisabled();
  await page.getByTestId('restrict-reason-input').fill(POST_REASON); await page.getByTestId('restrict-confirm').click();
  await expect(page.getByTestId(`flag-row-${FLAGS[3]}`)).toHaveAttribute('data-status', 'actioned');
  await expect(page.getByTestId(`flag-restrict-btn-${FLAGS[3]}`)).toHaveCount(0);
  await adminTab(page, 'restrictions');
  await expect(page.getByTestId('restriction-row-r2')).toHaveAttribute('data-status', 'active');
  await expect(page.getByTestId('restriction-row-r2')).toHaveAttribute('data-kind', 'quest_post');
  await expect(page.getByTestId('restriction-row-r2')).toHaveAttribute('data-user', 'kang');
  await actionInViewport(page, 'restriction-lift-btn-r2');
  let db = await getDB(page); const kang = db.restrictions.find(r => r.id === 'r2')!;
  expect(kang).toMatchObject({ userId: 'kang', kind: 'quest_post', flagId: FLAGS[3], createdBy: 'ops', reason: POST_REASON });
  expect(Date.parse(kang.endsAt!) - Date.parse(kang.startsAt)).toBe(7 * 86400000);
  expect(db.flagStates[FLAGS[3]]).toMatchObject({ status: 'actioned', evidenceCount: 3 });

  await createRestriction(page, 'kim', ['quest_post', 'purchase'], '3d', KIM_REASON);
  for (const [id, kind] of [['r3', 'quest_post'], ['r4', 'purchase']] as const) {
    await expect(page.getByTestId(`restriction-row-${id}`)).toHaveAttribute('data-kind', kind);
    await expect(page.getByTestId(`restriction-row-${id}`)).toHaveAttribute('data-user', 'kim');
    await expect(page.getByTestId(`restriction-row-${id}`)).toHaveAttribute('data-status', 'active');
  }
  db = await getDB(page); expect(db.adminLog).toHaveLength(initial.adminLog.length + 3);
  for (const id of ['r3', 'r4']) { const restriction = db.restrictions.find(r => r.id === id)!; expect(Date.parse(restriction.endsAt!) - Date.parse(restriction.startsAt)).toBe(3 * 86400000); }
  expect(db.adminLog.slice(0, initial.adminLog.length)).toEqual(initial.adminLog);
  await page.getByTestId('restrict-new-btn').click(); await page.getByTestId('restrict-user-select').selectOption('kim');
  for (const kind of ['quest_post', 'purchase']) await expect(page.getByTestId(`restrict-kind-${kind}`)).toBeDisabled();
  await expect(page.getByTestId('restrict-confirm')).toBeDisabled(); await page.keyboard.press('Escape');
  expect((await getDB(page)).adminLog).toEqual(db.adminLog);

  await switchPersona(page, 'kim'); await expect(page.getByTestId('nav-admin')).toHaveCount(0);
  await page.goto('/quests/board'); await hydrated(page);
  await expect(page.getByTestId('restriction-banner')).toHaveAttribute('data-kinds', 'quest_post,purchase');
  await expect(page.getByTestId('restriction-banner')).toContainText(KIM_REASON);
  await expect(page.getByTestId('board-new-btn')).toBeDisabled(); await expect(disabledReason(page, 'board-new-btn')).toContainText('운영자 제재로 퀘스트 등록이 제한됐어요');
  await page.goto('/quests/new'); await hydrated(page); await expect(page.getByTestId('quest-submit')).toBeDisabled();
  await expect(disabledReason(page, 'quest-submit')).toContainText(KIM_REASON);
  await page.goto('/village/m4'); await hydrated(page); await expect(page.getByTestId('buy-btn')).toHaveAttribute('data-state', 'restricted'); await expect(page.getByTestId('buy-btn')).toBeDisabled();
  await expect(disabledReason(page, 'buy-btn')).toContainText('운영자 제재로 구매가 제한됐어요');
  const likes = (await getDB(page)).items.find(item => item.id === 'm4')!.likeCount;
  await page.getByTestId('item-like-m4').click(); await expect(page.getByTestId('item-like-count-m4')).toHaveText(String(likes + 1));
  await page.getByTestId('item-teams-btn').click(); await expect(page.getByTestId('teams-chat')).toBeVisible();
  await page.getByTestId('teams-input').fill('제한 기간에도 전달 일정은 문의할 수 있나요'); await page.getByTestId('teams-send').click();
  await expect(page.getByTestId('teams-msg').last()).toContainText('제한 기간에도 전달 일정은 문의할 수 있나요'); await page.getByTestId('teams-close').click();
  await switchPersona(page, 'lee'); await openOrg(page);
  for (const action of ['reserve', 'final']) { await expect(page.getByTestId(`org-${action}-kim`)).toBeDisabled(); await expect(disabledReason(page, `org-${action}-kim`)).toContainText('구매 제한 중인 직원이에요'); }
  await page.keyboard.press('Escape');

  await switchPersona(page, 'ops'); await page.goto('/admin?tab=restrictions'); await hydrated(page); await lift(page, 'r2');
  const other = await context.newPage(), errors: string[] = [];
  other.on('pageerror', error => errors.push(error.message)); other.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await bootstrap(other, { fresh: false, route: '/village/m4' }); await switchPersona(other, 'kim');
  await expect(other.getByTestId('buy-btn')).toHaveAttribute('data-state', 'restricted');
  await lift(page, 'r4'); await expect(other.getByTestId('buy-btn')).toHaveAttribute('data-state', 'buy'); await expect(other.getByTestId('buy-btn')).toBeEnabled();
  await expect(other.getByTestId('restriction-banner')).toHaveAttribute('data-kinds', 'quest_post');
  await expect(page.getByTestId('restriction-row-r3')).toHaveAttribute('data-status', 'active');
  await expect(page.getByTestId('restriction-lift-btn-r4')).toHaveCount(0);
  await adminTab(page, 'log'); await expect(page.locator('[data-testid="admin-log-row"][data-action="restrict"]')).toHaveCount(4);
  await expect(page.locator('[data-testid="admin-log-row"][data-action="lift"]')).toHaveCount(3);
  db = await getDB(page); expect(db.adminLog).toHaveLength(initial.adminLog.length + 5); expect(db.adminLog.slice(0, initial.adminLog.length)).toEqual(initial.adminLog);
  expect(errors).toEqual([]); await other.close();
});

test('registration and purchase restrictions still allow inquiry answers, result submission and handover Teams @p5b',async({page})=>{
 await bootstrap(page,{persona:'ops',route:'/admin?tab=restrictions'});await createRestriction(page,'kim',['quest_post','purchase'],'3d',KIM_REASON);await switchPersona(page,'kim');await page.goto('/quests/6');await hydrated(page);await fillEditor(page,'inquiry-answer-editor','<p>해외 결제 영수증과 카드 명세서를 함께 첨부하면 됩니다.</p>');await expect(page.getByTestId('inquiry-answer-submit')).toBeEnabled();await page.getByTestId('inquiry-answer-submit').click();expect((await getDB(page)).quests.find(q=>q.no===6)!.answers!.some(a=>a.authorId==='kim')).toBe(true);
 await switchPersona(page,'ops');await page.goto('/admin?tab=restrictions');await hydrated(page);await createRestriction(page,'lee',['quest_post','purchase'],'3d',KIM_REASON);await switchPersona(page,'kim');await page.goto('/quests/7');await hydrated(page);await page.getByTestId('adopt-btn-lee').click();await switchPersona(page,'lee');await fillEditor(page,'worker-editor','<p>업무 결과와 검증 자료를 모두 작성하여 제출합니다.</p>');await page.getByTestId('submit-result-btn').click();await expect(page.getByTestId('submission-v1')).toBeVisible();await page.getByTestId('teams-open-btn').click();await expect(page.getByTestId('teams-chat')).toHaveAttribute('data-context','handover');await expect(page.getByTestId('teams-input')).toBeEnabled();
});

for (const id of [FLAGS[0], FLAGS[1]]) test(`dismiss ${id} requires a reason, cancels atomically and writes exactly one immutable audit row @p5b`, async ({ page }) => {
  await bootstrap(page, { persona: 'ops', route: '/admin' }); const before = await getDB(page);
  await page.getByTestId(`flag-dismiss-btn-${id}`).click(); await expect(page.getByTestId('dismiss-modal')).toBeVisible();
  await expect(page.getByTestId('dismiss-confirm')).toBeDisabled(); await page.getByTestId('dismiss-reason-input').fill('사유네자'); await expect(page.getByTestId('dismiss-confirm')).toBeDisabled();
  await page.keyboard.press('Escape'); expect(await getDB(page)).toEqual(before);
  await page.getByTestId(`flag-dismiss-btn-${id}`).click(); await page.getByTestId('dismiss-reason-input').fill('관련 업무 요청과 승인 내역을 확인하여 무혐의 처리합니다');
  await page.getByTestId('dismiss-confirm').click(); await expect(page.getByTestId(`flag-row-${id}`)).toHaveAttribute('data-status', 'dismissed');
  await expect(page.getByTestId(`flag-dismiss-btn-${id}`)).toHaveCount(0); await expect(page.getByTestId(`flag-restrict-btn-${id}`)).toHaveCount(0);
  const after = await getDB(page); expect(after.adminLog).toHaveLength(before.adminLog.length + 1); expect(after.adminLog.slice(0, before.adminLog.length)).toEqual(before.adminLog);
  expect(after.adminLog.at(-1)).toMatchObject({ action: 'dismiss_flag', flagId: id, actorId: 'ops' }); expect(after.flagStates[id]?.status).toBe('dismissed');
  await adminTab(page, 'log'); await expect(page.locator('[data-testid="admin-log-row"][data-action="dismiss_flag"]')).toHaveCount(1);
});

test('one-day restriction expires on the open player screen within one second without reload @p5b', async ({ page }) => {
  await page.clock.install({ time: new Date(FIXED_TIME) }); await bootstrap(page,{persona:'lee',route:'/village/m4',fixedTime:null});await designateFinal(page,'kim');await switchPersona(page,'ops');await page.goto('/admin?tab=restrictions');await hydrated(page);
  await createRestriction(page, 'kim', ['purchase'], '1d', '구매 내역 확인을 위해 하루 동안 구매를 제한합니다');
  const restriction = (await getDB(page)).restrictions.find(restriction => restriction.id === 'r2')!;
  expect(Date.parse(restriction.endsAt!) - Date.parse(restriction.startsAt)).toBe(86400000);
  await switchPersona(page, 'kim'); await page.goto('/village/m4'); await hydrated(page);
  await expect(page.getByTestId('buy-btn')).toHaveAttribute('data-state', 'restricted'); await expect(page.getByTestId('restriction-banner')).toBeVisible();
  await page.clock.fastForward('24:00:00');
  await expect(page.getByTestId('buy-btn')).toHaveAttribute('data-state', 'buy', { timeout: 1000 }); await expect(page.getByTestId('buy-btn')).toBeEnabled();
  await expect(page.getByTestId('restriction-banner')).toHaveCount(0);
  await switchPersona(page, 'ops'); await page.goto('/admin?tab=restrictions'); await hydrated(page);
  await expect(page.getByTestId('restriction-row-r2')).toHaveAttribute('data-status', 'expired'); await expect(page.getByTestId('restriction-lift-btn-r2')).toHaveCount(0);
  expect((await getDB(page)).adminLog).toHaveLength(3);
});

test('five-day stale seed warning resets through DEBUG and restores four fresh cases @p5b', async ({ page }) => {
  await page.clock.install({ time: new Date(FIXED_TIME) }); await bootstrap(page, { persona: 'ops', route: '/admin', fixedTime: null });
  await expect(page.getByTestId('admin-stale-seed')).toHaveCount(0); const seededAt = (await getDB(page)).seededAt;
  await page.clock.fastForward(5 * 86400000); await expect(page.getByTestId('admin-stale-seed')).toContainText('시드 적재 후 5일');
  await page.getByTestId('debug-menu').click(); await page.getByTestId('debug-reset-data').click(); await page.getByTestId('confirm-ok').click();
  await expect(page.getByTestId('admin-stale-seed')).toHaveCount(0); await expect(page.locator('[data-testid^="flag-row-"]')).toHaveCount(4);
  const reset = await getDB(page); expect(Date.parse(reset.seededAt)).toBeGreaterThan(Date.parse(seededAt)); expect(reset.restrictions).toHaveLength(1); expect(reset.adminLog).toHaveLength(2);
  await expect(page.getByTestId('admin-badge')).toBeVisible();
});
