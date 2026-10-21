import { test, expect, bootstrap, agreePledge, expectHyperFrame, FIXED_TIME, getDB, switchPersona } from './helpers';
import { attachSpreadsheet, prepareQuest } from './quest-helpers';

test('self-hosted TinyMCE accepts real typing; pledged request commits escrow immediately and opens board row8 @p4a',async({page})=>{
  const cloudRequests:string[]=[];page.on('request',request=>{if(request.url().includes('tiny.cloud'))cloudRequests.push(request.url());});
  await bootstrap(page,{route:'/quests/new'});await prepareQuest(page,{body:'<p></p>'});
  const editor=page.getByTestId('quest-body-editor');await expect(editor).toHaveAttribute('data-editor-kind','tinymce');
  const body=page.frameLocator('[data-testid="quest-body-editor"] iframe').locator('body');await body.click();await body.pressSequentially('원가 분석 원본 자료를 정리하고 보고서 생성을 자동화해 주세요.');
  const badge=await attachSpreadsheet(page);await expect(badge).toContainText('e2e_원본.xlsx');await expect(badge).toContainText('2.0 KB');
  await expect(page.getByTestId('quest-escrow-preview')).toContainText(/1,500[\s\S]*1,200/);await expect(page.getByTestId('quest-reward-preview')).toContainText('400 P');await expect(page.getByTestId('quest-checklist')).toContainText('3/4');
  const before=await getDB(page);await page.getByTestId('quest-submit').click();await expect(page.getByTestId('pledge-modal')).toBeVisible();expect(await getDB(page)).toEqual(before);
  await expect(page.getByTestId('pledge-confirm')).toBeDisabled();await agreePledge(page);await page.getByTestId('pledge-confirm').click();
  await expect(page.getByTestId('hyperframe')).toBeVisible();const committed=await getDB(page);expect(committed.users.kim!.points).toBe(1200);expect(committed.quests).toHaveLength(8);
  const quest=committed.quests.find(q=>q.no===8)!;expect(quest).toMatchObject({title:'E2E 원가 매크로 요청',type:'request',status:'recruiting',requesterId:'kim',bounty:300,escrowHeld:300});expect(quest.bodyHtml).toContain('자동화해 주세요');expect(quest.attachments[0]).toMatchObject({kind:'sharepoint',fileName:'e2e_원본.xlsx'});expect(committed.daily.kim!.achieved.post).toBe(true);expect(committed.transactions.at(-1)).toMatchObject({type:'bounty_escrow',amount:-300,refId:'8'});
  await expectHyperFrame(page,'post');await expect(page).toHaveURL(/\/quests\/board$/);await expect(page.getByTestId('points-chip')).toContainText('1,200');
  const rows=page.locator('[data-testid^="board-row-"]').filter({has:page.locator('td')});await expect(rows.first()).toHaveAttribute('data-testid','board-row-8');await expect(page.getByTestId('board-row-8')).toContainText('E2E 원가 매크로 요청');await expect(page.getByTestId('board-row-status-8')).toContainText('모집중');
  expect(cloudRequests).toEqual([]);await expect(page.getByText(/This domain is not registered|API key/i)).toHaveCount(0);
  await page.getByTestId('side-quest-daily').click();await expect(page.getByTestId('daily-claim-post')).toBeEnabled();await expect(page.getByTestId('daily-progress-post')).toHaveAttribute('aria-valuenow','100');
});

test('security pledge resets all checks; cancel, Escape and backdrop leave DB unchanged; focus stays trapped @p4a',async({page})=>{
  await bootstrap(page,{route:'/quests/new'});await prepareQuest(page);const before=await getDB(page),modal=page.getByTestId('pledge-modal');
  await page.getByTestId('quest-submit').click();await expect(page.getByTestId('pledge-check-1')).toBeFocused();await page.getByTestId('pledge-check-1').check();await page.getByTestId('pledge-cancel').click();await expect(modal).toBeHidden();expect(await getDB(page)).toEqual(before);
  await page.getByTestId('quest-submit').click();for(const n of [1,2,3])await expect(page.getByTestId(`pledge-check-${n}`)).not.toBeChecked();
  await page.getByTestId('pledge-check-1').check();await page.getByTestId('pledge-check-2').check();await expect(page.getByTestId('pledge-confirm')).toBeDisabled();
  await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');expect(await modal.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');await expect(modal).toBeHidden();expect(await getDB(page)).toEqual(before);
  await page.getByTestId('quest-submit').click();await agreePledge(page);await expect(page.getByTestId('pledge-confirm')).toBeEnabled();await page.mouse.click(8,8);await expect(modal).toBeHidden();expect(await getDB(page)).toEqual(before);
  await page.getByTestId('quest-submit').click();for(const n of [1,2,3])await expect(page.getByTestId(`pledge-check-${n}`)).not.toBeChecked();await expect(page.getByTestId('pledge-confirm')).toBeDisabled();
});

test('inquiry permits only image attachment and stores Base64 thumbnail without SharePoint conversion @p4a',async({page})=>{
  await bootstrap(page,{route:'/quests/new'});await prepareQuest(page,{bounty:0});await page.getByTestId('quest-type-inquiry').click();
  await expect(page.getByTestId('quest-attach-input')).toHaveCount(0);await expect(page.getByTestId('quest-screenshot-input')).toHaveAttribute('accept','image/*');
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');
  await page.getByTestId('quest-screenshot-input').setInputFiles({name:'보안 화면.png',mimeType:'image/png',buffer:png});
  await expect(page.getByTestId('image-attachment')).toBeVisible();await expect(page.getByTestId('sharepoint-badge')).toHaveCount(0);
  await page.getByTestId('quest-submit').click();await agreePledge(page);await page.getByTestId('pledge-confirm').click();await expectHyperFrame(page,'post');
  const db=await getDB(page),attachment=db.quests.find(q=>q.no===8)!.attachments[0]!;expect(attachment.kind).toBe('image');expect(attachment.dataUrl).toMatch(/^data:image\/png;base64,/);expect(attachment.url).toBeUndefined();expect(db.users.kim!.points).toBe(1500);
});

test('bounty input and slider clamp to persona balance and over-balance preset is disabled @p4a',async({page})=>{
  await bootstrap(page,{route:'/quests/new'});await switchPersona(page,'lee');
  await page.getByTestId('quest-bounty-input').fill('1000');await page.getByTestId('quest-title').focus();await expect(page.getByTestId('quest-bounty-input')).toHaveValue('300');await expect(page.getByTestId('quest-bounty-slider')).toHaveAttribute('max','300');await expect(page.getByTestId('quest-bounty-preset-500')).toBeDisabled();
  await page.getByTestId('quest-bounty-preset-50').click();await expect(page.getByTestId('quest-bounty-input')).toHaveValue('50');await expect(page.getByTestId('quest-escrow-preview')).toContainText(/300[\s\S]*250/);
});

test('expired timer blocks form submission with exact reason, keeping form readable @p4a',async({page})=>{
  await bootstrap(page,{route:'/quests/new'});await prepareQuest(page);await page.getByTestId('timer-ctl-expire').click();
  await expect(page.getByTestId('quest-submit')).toBeDisabled();await expect(page.locator('[data-testid="disabled-reason"][data-for="quest-submit"]')).toContainText('오늘 작업 가능 시간을 모두 사용했어요 (00:00:00)');await expect(page.getByTestId('quest-title')).toHaveValue('E2E 원가 매크로 요청');
  expect((await getDB(page)).quests).toHaveLength(7);
});

test('unavailable TinyMCE script selects complete fallback editor and accepts real input @p4a',async({page})=>{
  // Empty local script simulates an unavailable TinyMCE global without generating
  // an intentional browser network error in the zero-console-error gate.
  await page.route('**/tinymce/tinymce.min.js',route=>route.fulfill({status:200,contentType:'application/javascript',body:'/* TinyMCE unavailable */'}));
  await bootstrap(page,{route:'/quests/new'});
  const editor=page.getByTestId('quest-body-editor');await expect(editor).toHaveAttribute('data-editor-kind','fallback',{timeout:15000});
  const body=editor.locator('[contenteditable="true"]');await body.click();await body.pressSequentially('대체 편집기를 통해 원가 분석 자료를 정리하고 자동화 업무를 요청합니다.');
  expect(await page.evaluate(()=>window.__OQ_EDITORS__!['quest-body-editor']!.getContent())).toContain('대체 편집기');
  await expect(editor).toContainText('TinyMCE 5.10.2');await expect(editor.getByRole('button',{name:/굵게|Bold/i})).toBeVisible();await expect(editor.getByRole('button',{name:/표 삽입|Table/i})).toBeVisible();
  await expect(page.getByText(/This domain is not registered|API key/i)).toHaveCount(0);
});

test('separate uploads at fixed time have distinct identities; removing one preserves the other @p4a',async({page})=>{
  await bootstrap(page,{route:'/quests/new'});await prepareQuest(page);await attachSpreadsheet(page,'첫번째.xlsx');
  await page.getByTestId('quest-attach-input').setInputFiles({name:'두번째.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.alloc(1024,65)});
  await expect(page.getByTestId('sharepoint-badge')).toHaveCount(2);await page.getByRole('button',{name:'첫번째.xlsx 삭제',exact:true}).click();await expect(page.getByTestId('sharepoint-badge')).toHaveCount(1);await expect(page.getByTestId('sharepoint-badge')).toContainText('두번째.xlsx');
  await page.getByTestId('quest-submit').click();await agreePledge(page);await page.getByTestId('pledge-confirm').click();await expectHyperFrame(page,'post');
  expect((await getDB(page)).quests.find(q=>q.no===8)!.attachments.map(a=>a.fileName)).toEqual(['두번째.xlsx']);
});
test('changing type during 600ms conversion cancels SharePoint attachment before inquiry receives it @p4a',async({page})=>{
  await page.clock.install({time:new Date(FIXED_TIME)});await bootstrap(page,{fixedTime:null,route:'/quests/new'});await prepareQuest(page);
  await page.getByTestId('quest-attach-input').setInputFiles({name:'변환중.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.alloc(1024,65)});
  await expect(page.getByRole('progressbar',{name:'첨부파일 준비 중'})).toBeVisible();await page.getByTestId('quest-type-inquiry').click();await page.clock.runFor(650);
  await expect(page.getByTestId('sharepoint-badge')).toHaveCount(0);await expect(page.getByRole('progressbar',{name:'첨부파일 준비 중'})).toHaveCount(0);await expect(page.getByTestId('quest-attach-input')).toHaveCount(0);
});
