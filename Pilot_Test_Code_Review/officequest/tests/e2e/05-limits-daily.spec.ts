import { test, expect, bootstrap, getDB, hydrated, scenario } from './helpers';

test('daily completion limit blocks park applications and limitApprove approvals, preserving rejection route @p4b',async({page})=>{
  await bootstrap(page,{persona:'park',route:'/quests/7'});await expect(page.getByTestId('quest-apply-btn')).toBeDisabled();await expect(page.locator('[data-testid="disabled-reason"][data-for="quest-apply-btn"]')).toContainText('오늘 완료 한도(2/2)에 도달했어요');
  await page.getByTestId('persona-switcher').click();await page.getByTestId('persona-option-kim').click();await scenario(page,'limitApprove');
  await expect(page.getByTestId('approve-btn')).toBeDisabled();await expect(page.locator('[data-testid="disabled-reason"][data-for="approve-btn"]')).toContainText('작업자의 오늘 완료 한도(2/2) 도달 · 내일 승인할 수 있어요');await expect(page.getByTestId('reject-btn')).toBeEnabled();
  await page.getByTestId('reject-btn').click();await page.getByTestId('reject-reason-input').fill('검수 가능한 서식으로 보완해 주세요');await page.getByTestId('reject-confirm').click();await expect(page.getByTestId('quest-status-badge')).toHaveAttribute('data-status','revision');expect((await getDB(page)).users.park!.completedToday).toBe(2);
});
test('login daily reward is claimed once: 1510P,1218EXP,Lv13, persistent claimed button @p4b',async({page})=>{
  await bootstrap(page,{route:'/quests/daily'});await expect(page.getByTestId('daily-progress-login')).toHaveAttribute('aria-valuenow','100');await expect(page.getByTestId('daily-claim-login')).toBeEnabled();await page.getByTestId('daily-claim-login').click();await expect(page.getByTestId('points-chip')).toContainText('1,510');await expect(page.getByTestId('daily-claim-login')).toBeDisabled();await expect(page.getByTestId('daily-claim-login')).toContainText('오늘 보상 수령 완료');
  const after=await getDB(page);expect(after.users.kim).toMatchObject({points:1510,exp:1218});expect(after.daily.kim!.claimed.login).toBe(true);expect(after.transactions.filter(t=>t.type==='daily_reward'&&t.userId==='kim')).toHaveLength(1);
  await page.reload();await hydrated(page);await expect(page.getByTestId('daily-claim-login')).toBeDisabled();expect((await getDB(page)).users.kim!.points).toBe(1510);await page.goto('/');await hydrated(page);await expect(page.getByTestId('dash-level')).toHaveText('Lv.13');await expect(page.getByTestId('dash-exp-bar')).toHaveAttribute('aria-valuenow','18');
});
