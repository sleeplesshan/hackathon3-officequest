import { test, expect, bootstrap, getDB, hydrated, switchPersona, FIXED_TIME, fillEditor } from './helpers';

test('expired public board shows notice; my requested and participated quests remain accessible, direct URLs cannot bypass it',async({page})=>{
  await bootstrap(page,{route:'/quests/board'});
  await page.getByTestId('timer-ctl-expire').click();
  await expect(page.getByTestId('quest-time-locked')).toContainText('오늘 참여 가능한 시간이 모두 지났어요');
  await expect(page.getByTestId('board-row-7')).toHaveCount(0);
  await expect(page.getByTestId('side-quest-board')).toHaveAttribute('aria-disabled','true');
  await page.getByTestId('side-quest-board').click({force:true});
  await expect(page.getByTestId('toast')).toHaveText('오늘 참여 가능한 시간이 모두 지났어요');
  await page.getByTestId('side-mine-requested').click();
  await expect(page.getByTestId('board-row-7')).toBeVisible();await expect(page.getByTestId('board-row-3')).toHaveCount(0);
  await page.getByTestId('board-row-7').click();await expect(page.getByTestId('quest-detail')).toBeVisible();
  await page.getByTestId('side-mine-applied').click();await expect(page.getByTestId('board-row-2')).toBeVisible();
  const views=(await getDB(page)).quests.find(q=>q.no===3)!.views;
  await page.goto('/quests/3');await hydrated(page);await expect(page.getByTestId('quest-time-locked')).toBeVisible();
  expect((await getDB(page)).quests.find(q=>q.no===3)!.views).toBe(views);
  await page.goto('/quests/board?mine=other');await hydrated(page);await expect(page.getByTestId('quest-time-locked')).toBeVisible();
  await page.getByTestId('timer-ctl-reset').click();await expect(page.getByTestId('board-row-3')).toBeVisible();
  await page.getByTestId('timer-ctl-expire').click();await switchPersona(page,'ops');await expect(page.getByTestId('board-row-3')).toBeVisible();
});

test('countdown expiry and next KST day update board access without reloading',async({page})=>{
  await page.clock.install({time:new Date(FIXED_TIME)});await bootstrap(page,{fixedTime:null,route:'/quests/board'});
  await page.clock.fastForward('02:00:01');await expect(page.getByTestId('quest-time-locked')).toBeVisible();
  await page.clock.fastForward('08:00:00');await expect(page.getByTestId('board-row-7')).toBeVisible();
});

test('tier guide contains all six male and female appearances; keyboard close restores focus',async({page})=>{
  await bootstrap(page);const info=page.getByTestId('character-info');await info.click();
  const modal=page.getByTestId('tier-guide-modal');await expect(modal).toContainText('100 EXP마다 레벨이 1');
  await expect(modal.locator('.tier-guide-tile')).toHaveCount(6);
  await expect.poll(()=>modal.locator('canvas[data-loaded="true"]').count()).toBe(6);
  await modal.getByRole('button',{name:'여성 캐릭터',exact:true}).click();
  await expect.poll(()=>modal.locator('canvas[data-gender="female"][data-loaded="true"]').count()).toBe(6);
  await page.screenshot({path:'qa/screens/feedback-tier-guide-female.png',fullPage:true});
  await page.keyboard.press('Escape');await expect(modal).toHaveCount(0);await expect(info).toBeFocused();
});

test('wardrobe saves two selected parts per persona and after reload; locked outfit cannot be chosen; cancel does not save',async({page})=>{
  await bootstrap(page);const before=(await getDB(page)).users.kim!.points;
  await page.getByTestId('character-customize').click();const wardrobe=page.getByTestId('character-wardrobe');
  await wardrobe.getByRole('button',{name:'여성 캐릭터',exact:true}).click();await page.getByTestId('character-hair-wave').click();
  await expect(page.getByTestId('character-outfit-platinum')).toBeDisabled();await page.getByTestId('character-outfit-silver').click();
  await expect(wardrobe.locator('.wardrobe-preview canvas')).toHaveAttribute('data-hair','wave');
  await expect(wardrobe.locator('.wardrobe-preview canvas')).toHaveAttribute('data-tier','silver');
  await expect.poll(()=>wardrobe.locator('canvas[data-loaded="true"]').count()).toBe(9);
  await page.screenshot({path:'qa/screens/feedback-character-wardrobe.png',fullPage:true});
  await page.getByTestId('character-save').click();await expect(wardrobe).toHaveCount(0);
  expect((await getDB(page)).users.kim!.appearance).toEqual({gender:'female',hair:'wave',outfit:'silver'});expect((await getDB(page)).users.kim!.points).toBe(before);
  await page.reload();await hydrated(page);const hero=page.getByTestId('dash-character-card').locator('canvas[data-name="character"]');
  await expect(hero).toHaveAttribute('data-gender','female');await expect(hero).toHaveAttribute('data-tier','silver');await expect(hero).toHaveAttribute('data-loaded','true');await expect(hero).toHaveAttribute('width','24');await expect(hero).toHaveAttribute('height','24');
  await switchPersona(page,'lee');await expect(hero).toHaveAttribute('data-gender','male');await expect(hero).toHaveAttribute('data-hair','classic');
  await switchPersona(page,'kim');await page.getByTestId('character-customize').click();await page.getByTestId('character-hair-classic').click();await wardrobe.getByRole('button',{name:'취소',exact:true}).click();
  expect((await getDB(page)).users.kim!.appearance?.hair).toBe('wave');
});

test('season reset keeps hairstyle, falls back to unlocked clothes, and costume choice remains available after expiry',async({page})=>{
  await bootstrap(page);await page.getByTestId('character-customize').click();await page.getByTestId('character-hair-wave').click();await page.getByTestId('character-outfit-gold').click();await page.getByTestId('character-save').click();
  await page.getByTestId('season-reset-btn').click();await page.getByTestId('confirm-ok').click();
  const hero=page.getByTestId('dash-character-card').locator('canvas[data-name="character"]');await expect(hero).toHaveAttribute('data-tier','bronze');await expect(hero).toHaveAttribute('data-hair','wave');
  await page.getByTestId('timer-ctl-expire').click();await page.getByTestId('character-customize').click();await expect(page.getByTestId('character-outfit-gold')).toBeDisabled();await page.getByTestId('character-outfit-auto').click();await page.getByTestId('character-save').click();
  expect((await getDB(page)).users.kim!.appearance?.outfit).toBe('auto');
});

test('mobile personal quests and character dialogs remain reachable without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});await bootstrap(page,{route:'/quests/board'});await page.getByTestId('timer-ctl-expire').click();
  const own=page.getByTestId('side-mine-requested');await own.scrollIntoViewIfNeeded();await own.click();await expect(page.getByTestId('board-row-7')).toBeVisible();
  await page.getByTestId('nav-dashboard').click();await page.getByTestId('character-customize').click();const modal=page.getByTestId('character-wardrobe');
  await modal.getByRole('button',{name:'여성 캐릭터',exact:true}).click();await page.getByTestId('character-hair-wave').click();
  expect(await modal.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  await page.getByTestId('character-save').scrollIntoViewIfNeeded();await page.getByTestId('character-save').click();await expect(modal).toHaveCount(0);
});


test('inquiry answer counts as participation after expiry and other inquiries stay locked',async({page})=>{
  await bootstrap(page,{route:'/quests/3'});
  await fillEditor(page,'inquiry-answer-editor','<p>설정 화면의 공유 권한을 조직 내 사용자로 변경하면 해결할 수 있습니다.</p>');
  await page.getByTestId('inquiry-answer-submit').click();
  await page.getByTestId('timer-ctl-expire').click();
  await expect(page.getByTestId('quest-time-locked')).toHaveCount(0);
  await page.getByTestId('side-mine-applied').click();await expect(page.getByTestId('board-row-3')).toBeVisible();
  await page.getByTestId('board-row-3').click();await expect(page.getByTestId('quest-detail')).toBeVisible();
  await page.goto('/quests/6');await hydrated(page);await expect(page.getByTestId('quest-time-locked')).toBeVisible();
});
