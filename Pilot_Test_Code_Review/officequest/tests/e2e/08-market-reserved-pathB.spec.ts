import { test, expect, bootstrap, getDB, switchPersona } from './helpers';
import { openOrg, designateFinal } from './market-helpers';

test('reservation alone has no receipt CTA; final designation permits only that buyer @p5',async({page})=>{
 await bootstrap(page,{route:'/village/m1'});await openOrg(page);await page.getByTestId('org-reserve-park').click();expect((await getDB(page)).items.find(i=>i.id==='m1')!.status).toBe('available');await page.getByTestId('org-apply').click();await switchPersona(page,'park');await expect(page.getByTestId('buy-btn')).toHaveCount(0);await switchPersona(page,'lee');await expect(page.getByTestId('buy-btn')).toHaveCount(0);
 await switchPersona(page,'kim');await designateFinal(page,'park');await switchPersona(page,'park');await page.getByTestId('buy-btn').click();await expect(page.getByTestId('settlement-panel')).toBeVisible();const db=await getDB(page);expect(db.items.find(i=>i.id==='m1')).toMatchObject({status:'sold',buyerId:'park',reservedFor:null,pendingRequest:null});expect(db.users.park!.points).toBe(4700);expect(db.users.kim!.points).toBe(2000);
});
test('seller can replace and release reservations without moving points or creating transactions @p5',async({page})=>{
  await bootstrap(page,{persona:'park',route:'/village/m7'});const initial=await getDB(page);await openOrg(page);await page.getByTestId('org-reserve-kim').click();await page.getByTestId('org-apply').click();expect((await getDB(page)).items.find(i=>i.id==='m7')!.reservedFor).toBe('kim');
  await openOrg(page);await page.getByTestId('org-reserve-jung').click();await page.getByTestId('org-apply').click();expect((await getDB(page)).items.find(i=>i.id==='m7')!.reservedFor).toBe('jung');
  if(!await page.getByTestId('release-reservation-btn').isVisible())await page.getByTestId('seller-status-menu').click();await page.getByTestId('release-reservation-btn').click();await expect(page.getByTestId('item-status-m7')).toHaveAttribute('data-status','available');const after=await getDB(page);expect(after.items.find(i=>i.id==='m7')!.reservedFor).toBeNull();expect(after.transactions).toEqual(initial.transactions);for(const id of ['kim','park','jung'])expect(after.users[id]!.points).toBe(initial.users[id]!.points);
});
