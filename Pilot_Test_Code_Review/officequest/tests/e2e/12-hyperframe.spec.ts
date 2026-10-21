import { mkdir, writeFile } from 'node:fs/promises';
import { test, expect, bootstrap, expectHyperFrame } from './helpers';

for(const variant of ['post','clear'] as const){
  test(`${variant} overlay closes after 1800ms, traps focus and ignores Escape @p3`,async({page},testInfo)=>{
    await bootstrap(page);
    await page.getByTestId('theme-toggle').focus();
    await page.evaluate(variant=>window.__OQ_TEST__!.playHyperFrame(variant,{worker:'lee',bounty:300,fromLv:7,toLv:8,stars:3}),variant);
    const overlay=page.getByTestId('hyperframe');await expect(overlay).toBeVisible();await expect(overlay).toBeFocused();
    await page.keyboard.press('Escape');await expect(overlay).toBeVisible();
    await page.keyboard.press('Tab');await expect(overlay).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(overlay).toBeFocused();
    await page.getByTestId('theme-toggle').focus();await expect(overlay).toBeFocused();
    await expectHyperFrame(page,variant);
    await expect(page.getByTestId('theme-toggle')).toBeFocused();
    const record=await page.evaluate(()=>window.__OQ_TEST__!.hyperframes.at(-1));expect(record?.frames).toBeGreaterThan(0);
    await testInfo.attach('hyperframe-timing-frames',{body:JSON.stringify(record),contentType:'application/json'});
    await mkdir('qa/performance',{recursive:true});await writeFile(`qa/performance/hyperframe-${variant}.json`,JSON.stringify(record,null,2));
  });
  test(`${variant} overlay retains 1800ms behavior under reduced motion @p3`,async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});await bootstrap(page);
    await page.evaluate(variant=>window.__OQ_TEST__!.playHyperFrame(variant,{worker:'lee',bounty:300,fromLv:7,toLv:8,stars:3}),variant);
    await expectHyperFrame(page,variant);
  });
}
test('hyperframe queue shows both overlays sequentially without dropping requests @p3',async({page})=>{
  await bootstrap(page);
  await page.evaluate(()=>{window.__OQ_TEST__!.playHyperFrame('post',{bounty:300});window.__OQ_TEST__!.playHyperFrame('clear',{worker:'lee',bounty:300,fromLv:7,toLv:8,stars:3});});
  await expect(page.getByTestId('hyperframe')).toHaveAttribute('data-variant','post');
  await expect(page.getByTestId('hyperframe')).toHaveAttribute('data-variant','clear',{timeout:3000});
  await expect(page.getByTestId('hyperframe')).toBeHidden({timeout:3000});
  const records=await page.evaluate(()=>window.__OQ_TEST__!.hyperframes);
  expect(records).toHaveLength(2);expect(records.map(r=>r.variant)).toEqual(['post','clear']);
  for(const record of records){expect(record.closedAt!-record.openedAt).toBeGreaterThanOrEqual(1650);expect(record.closedAt!-record.openedAt).toBeLessThanOrEqual(1950);}
  expect(records[1]!.openedAt).toBeGreaterThanOrEqual(records[0]!.closedAt!);
});
