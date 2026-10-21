import type { Page } from '@playwright/test';
import { expect, fillEditor } from './helpers';

export async function openOrg(page:Page){
  const button=page.getByTestId('open-orgchart-btn');if(!await button.isVisible())await page.getByTestId('seller-status-menu').click();await button.click();await expect(page.getByTestId('orgchart-modal')).toBeVisible();
}
export async function prepareItem(page:Page,options:{title?:string;price?:number;free?:boolean;village?:string}={}){
  await page.getByTestId('item-village-select').selectOption(options.village??'changwon');await page.getByTestId('item-category-select').selectOption('hobby');await page.getByTestId('item-title').fill(options.title??'E2E 게임 장비 나눔');
  await page.getByTestId(options.free?'item-mode-free':'item-mode-sale').click();if(!options.free)await page.getByTestId('item-price-input').fill(String(options.price??100));await fillEditor(page,'item-body-editor','<p>깨끗하게 사용한 게임 장비입니다. 사내에서 직접 전달하겠습니다.</p>');
}
export const itemCards=(page:Page)=>page.locator('[data-testid^="item-card-"]');

export async function designateFinal(page:Page,id:string){await openOrg(page);await page.getByTestId(`org-final-${id}`).click();await page.getByTestId("org-apply").click();await expect(page.getByTestId("orgchart-modal")).toBeHidden();}
