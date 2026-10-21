import { mkdir, writeFile } from 'node:fs/promises';
import { test, expect, bootstrap, getDB, hydrated, scenario } from './helpers';

test('handover Teams replies exactly once after1200ms, prioritizes file keyword and persists thread @p4b',async({page})=>{
  await bootstrap(page,{route:'/quests/7'});await scenario(page,'ref07');await page.getByTestId('teams-open-btn').click();await expect(page.getByTestId('teams-chat')).toHaveAttribute('data-context','handover');await expect(page.getByTestId('teams-msg')).toHaveCount(4);await expect(page.getByTestId('teams-send')).toBeDisabled();
  await page.getByTestId('teams-input').fill('파일 링크와 마감 일정도 알려주세요');await page.getByTestId('teams-input').press('Enter');await expect(page.getByTestId('teams-typing')).toContainText('이퀘스트 사원님이 입력 중입니다...');await expect(page.getByTestId('teams-msg')).toHaveCount(5);await expect(page.getByTestId('teams-typing')).toBeHidden({timeout:2500});
  await expect(page.getByTestId('teams-msg')).toHaveCount(6);await expect(page.locator('[data-testid="teams-msg"][data-from="them"]')).toHaveCount(2);await expect(page.getByTestId('teams-msg').last()).toContainText('SharePoint 링크로 올려두었어요. 권한 문제 있으면 바로 말씀 주세요.');
  const records=await page.evaluate(()=>window.__OQ_TEST__!.teams);expect(records).toHaveLength(1);const record=records[0]!;expect(record.replyAt).not.toBeNull();expect(record.replyAt!-record.sentAt).toBeGreaterThanOrEqual(1000);expect(record.replyAt!-record.sentAt).toBeLessThanOrEqual(1400);await mkdir('qa/performance',{recursive:true});await writeFile('qa/performance/teams-handover.json',JSON.stringify(record,null,2));
  const thread=(await getDB(page)).teams['handover:7:kim:lee']!;expect(thread.pendingReplyFor).toBeNull();expect(thread.messages).toHaveLength(6);
  await page.getByTestId('teams-close').click();await expect(page.getByTestId('teams-chat')).toBeHidden();await page.getByTestId('teams-open-btn').click();await expect(page.getByTestId('teams-msg')).toHaveCount(6);await page.reload();await hydrated(page);await page.getByTestId('teams-open-btn').click();await expect(page.getByTestId('teams-msg')).toHaveCount(6);expect((await getDB(page)).teams['handover:7:kim:lee']!.messages).toEqual(thread.messages);
});


test('market Teams guides seller designation then receipt without promising approval, including legacy saved replies',async({page})=>{
  await bootstrap(page,{route:'/village/m2'});const before=await getDB(page);await page.getByTestId('item-teams-btn').click();
  for(const message of ['안녕하세요','구매할게요']){await page.getByTestId('teams-input').fill(message);await page.getByTestId('teams-send').click();await expect(page.getByTestId('teams-typing')).toBeVisible();await expect(page.getByTestId('teams-typing')).toBeHidden({timeout:2500});}
  const reply=page.getByTestId('teams-msg').last();await expect(reply).toContainText('구매하시면 최종 구매자로 등록해 드릴게요');await expect(reply).toContainText('[샀어요]를 눌러 주세요~');await expect(reply).not.toContainText('승인');
  await page.screenshot({path:'qa/screens/feedback-teams-market-guidance.png',fullPage:false});
  expect((await getDB(page)).transactions).toEqual(before.transactions);expect((await getDB(page)).items.find(i=>i.id==='m2')!.status).toBe('reserved');
  await page.evaluate(()=>{const db=JSON.parse(localStorage.getItem('oq:v1:db')!);db.teams['market:m2:kim:oh'].messages.at(-1).text='[샀어요] 눌러주시면 바로 승인할게요.';localStorage.setItem('oq:v1:db',JSON.stringify(db));});
  await page.reload();await hydrated(page);await page.getByTestId('item-teams-btn').click();await expect(page.getByTestId('teams-msg').last()).toContainText('최종 구매자로 등록');await expect(page.getByTestId('teams-msg').last()).not.toContainText('바로 승인');
});
