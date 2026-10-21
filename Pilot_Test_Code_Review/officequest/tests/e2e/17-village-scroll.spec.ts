import { test, expect, bootstrap, hydrated } from './helpers';
for(const viewport of [{width:1440,height:720},{width:1920,height:1080},{width:390,height:844}])test(`only products scroll while navigation title and filters stay fixed at ${viewport.width}x${viewport.height} @scroll`,async({page})=>{
 await page.setViewportSize(viewport);await bootstrap(page,{route:'/village'});
 // Simulate a growing catalogue so this contract holds beyond the eight seed cards.
 await page.evaluate(()=>{const stored=JSON.parse(localStorage.getItem('oq:v1:db')!);const original=stored.items.slice();stored.items=Array.from({length:40},(_,i)=>({...original[i%original.length],id:`scroll-${i}`,title:`스크롤 확인 상품 ${i+1}`}));stored.rev++;localStorage.setItem('oq:v1:db',JSON.stringify(stored));});await page.reload();await hydrated(page);
 const products=page.getByTestId('village-products-scroll'),fixed=[page.getByTestId('gnb'),page.getByRole('complementary',{name:'효성마을 사이드바'}),page.locator('.village-list-heading'),page.locator('.village-filter-bar')];
 const before=await Promise.all(fixed.map(el=>el.boundingBox()));const region=await products.boundingBox();expect(region!.height).toBeGreaterThan(100);expect(region!.y+region!.height).toBeLessThanOrEqual(viewport.height+1);expect(await products.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
 const card=page.locator('.village-item-card').first(),cardBefore=await card.boundingBox();await page.mouse.move(region!.x+region!.width/2,region!.y+region!.height/2);await page.mouse.wheel(0,600);await expect.poll(()=>products.evaluate(el=>el.scrollTop)).toBeGreaterThan(100);
 expect(await page.evaluate(()=>window.scrollY)).toBe(0);const after=await Promise.all(fixed.map(el=>el.boundingBox()));for(let i=0;i<before.length;i++){expect(Math.abs(after[i]!.y-before[i]!.y)).toBeLessThanOrEqual(1);expect(Math.abs(after[i]!.height-before[i]!.height)).toBeLessThanOrEqual(1);}expect((await card.boundingBox())!.y).toBeLessThan(cardBefore!.y-100);
 await products.evaluate(el=>el.scrollTop=el.scrollHeight);await page.mouse.wheel(0,2000);expect(await page.evaluate(()=>window.scrollY)).toBe(0);
 await products.evaluate(el=>el.scrollTop=0);await products.focus();await page.keyboard.press('PageDown');await expect.poll(()=>products.evaluate(el=>el.scrollTop)).toBeGreaterThan(20);
 await page.getByTestId('market-search').fill('존재하지않는상품');await expect(page.locator('.village-empty')).toBeVisible();expect(await page.evaluate(()=>window.scrollY)).toBe(0);await expect(page.getByTestId('market-search')).toBeVisible();
});
test('market detail and registration keep normal document scrolling @scroll',async({page})=>{
 await page.setViewportSize({width:1440,height:600});await bootstrap(page,{route:'/village/m1'});for(const route of ['/village/m1','/village/new']){await page.goto(route);await hydrated(page);await expect(page.locator('.village-browse-shell')).toHaveCount(0);await expect(page.locator('body')).toHaveCSS('overflow-y','auto');await page.mouse.move(1390,550);await page.mouse.wheel(0,500);await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(0);}
});
