import type { Page } from '@playwright/test';
import { expect, fillEditor } from './helpers';

export const QUEST_BODY='<h3>요청 배경</h3><p>3분기 결산을 위해 사업부별 원가 데이터를 매주 수작업으로 취합하고 있습니다. SAP 추출 원본 엑셀을 피벗 시트로 자동 정리하는 매크로를 요청드립니다.</p><h3>요청 사항</h3><table><thead><tr><th>항목</th><th>내용</th><th>우선순위</th></tr></thead><tbody><tr><td>원본 시트 정리</td><td>SAP 추출 시트 자동 분류</td><td>필수</td></tr><tr><td>피벗 자동 생성</td><td>월별 원가 피벗과 전년 대비 증감</td><td>필수</td></tr><tr><td>실행 버튼</td><td>갱신 버튼 한 번으로 실행</td><td>권장</td></tr></tbody></table>';
export async function prepareQuest(page:Page,options:{title?:string;bounty?:number;body?:string}={}){
  await page.getByTestId('quest-type-request').click();
  await page.getByTestId('quest-title').fill(options.title??'E2E 원가 매크로 요청');
  await page.getByTestId('quest-field').selectOption({label:'재무·엑셀 자동화'});
  await page.getByTestId('quest-due').fill('2026-10-23T18:00');
  await fillEditor(page,'quest-body-editor',options.body??QUEST_BODY);
  await page.getByTestId('quest-bounty-input').fill(String(options.bounty??300));
}
export async function attachSpreadsheet(page:Page,name='e2e_원본.xlsx',size=2048){
  await page.getByTestId('quest-attach-input').setInputFiles({name,mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.alloc(size,65)});
  const badge=page.getByTestId('sharepoint-badge');await expect(badge).toHaveAttribute('data-demo','true');return badge;
}
