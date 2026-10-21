import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Page } from '@playwright/test';
import { expect } from '../e2e/helpers';

export const REFERENCE_NAMES = ['01_dashboard_light', '02_daily_quests_tiers', '03_quest_board', '04_quest_create', '05_security_pledge_modal', '06_quest_detail_recruiting', '07_quest_detail_inprogress_teams', '08_hyperframe_complete', '09_village_market_dark', '10_village_detail_orgchart'];
export interface ComparisonResult { ref: string; status: 'PASS' | 'MISSING'; comparison: string; reason?: string }

export async function captureComparison(page: Page, name: string): Promise<ComparisonResult> {
  const id = name.slice(0, 2), comparison = `qa/compare/${id}.png`;
  let reference: Buffer, actual: Buffer;
  try { [reference, actual] = await Promise.all([readFile(path.resolve('../refs', `${name}.png`)), readFile(path.resolve('qa/screens', `${name}.png`))]); }
  catch (error) { return { ref: name, status: 'MISSING', comparison, reason: String(error) }; }
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;background:#e4e4e7;color:#18181b;font:14px system-ui}main{display:grid;grid-template-columns:960px 960px;width:1920px}figure{margin:0;width:960px}figcaption{height:40px;padding:10px 16px;background:#fff;border:1px solid #d4d4d8}img{display:block;width:960px;height:540px;object-fit:contain;background:#fff}</style></head><body><main><figure><figcaption>Reference · ${name}</figcaption><img alt="Reference" src="data:image/png;base64,${reference.toString('base64')}"></figure><figure><figcaption>Implementation · ${name}</figcaption><img alt="Implementation" src="data:image/png;base64,${actual.toString('base64')}"></figure></main></body></html>`);
  await expect(page.locator('img')).toHaveCount(2);
  expect(await page.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await expect(page.locator('figure').first()).toHaveCSS('width', '960px'); await expect(page.locator('figure').last()).toHaveCSS('width', '960px');
  await mkdir('qa/compare', { recursive: true }); await page.screenshot({ path: comparison, clip: { x: 0, y: 0, width: 1920, height: 580 } });
  return { ref: name, status: 'PASS', comparison };
}

export async function writeComparisonManifest(results: ComparisonResult[]) {
  await mkdir('qa/compare', { recursive: true }); await writeFile('qa/compare/status.json', JSON.stringify(results, null, 2));
}
