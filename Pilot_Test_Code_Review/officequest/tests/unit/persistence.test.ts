import { expect, it } from 'vitest';
import { readStored, saveStored } from '@/lib/db/persistence';
import { getSeed } from '@/lib/db/seed';
it('storage rejects malformed and mismatched schemas', () => {
  for (const text of ['{', 'null', '{}', '{"schemaVersion":2}']) expect(readStored({getItem:()=>text})).toBeNull();
});
it('round trips DB and revision; failed writes propagate for UI rollback', () => {
  let text = ''; const storage = {getItem:()=>text,setItem:(_key:string,value:string)=>{text=value;}};
  const db=getSeed(Date.parse('2026-10-21T14:02:48+09:00'));
  saveStored(storage,db,12); expect(readStored(storage)).toEqual({...db,rev:12});
  expect(()=>saveStored({setItem:()=>{throw new Error('QuotaExceededError');}},db,13)).toThrow('QuotaExceededError');
  expect(readStored(storage)?.rev).toBe(12);
});

it('legacy SharePoint URLs are removed from original files, submissions and answers while image data survives',()=>{
  const db=getSeed(Date.parse('2026-10-21T14:02:48+09:00'));const q=db.quests.find(q=>q.no===7)!;const file={id:'legacy',kind:'sharepoint' as const,fileName:'old.xlsx',sizeBytes:100,url:'https://hyosung.sharepoint.com/legacy.xlsx'};
  q.attachments=[file,{id:'image',kind:'image',fileName:'shot.png',sizeBytes:1,dataUrl:'data:image/png;base64,AA=='}];q.submissions=[{version:1,bodyHtml:'result',attachments:[file],submittedAt:''}];q.answers=[{id:'a1',authorId:'lee',bodyHtml:'answer',attachments:[file],createdAt:''}];
  const stored=readStored({getItem:()=>JSON.stringify({...db,rev:2})})!;const next=stored.quests.find(q=>q.no===7)!;
  expect(next.attachments[0]!.url).toBeUndefined();expect(next.submissions[0]!.attachments[0]!.url).toBeUndefined();expect(next.answers![0]!.attachments[0]!.url).toBeUndefined();expect(next.attachments[1]!.dataUrl).toBe('data:image/png;base64,AA==');expect(q.attachments[0]!.url).toBeDefined();
});

it('refreshes the legacy canned market approval reply while preserving user-authored and handover messages',()=>{
  const db=getSeed(Date.parse('2026-10-21T14:02:48+09:00'));const old='[샀어요] 눌러주시면 바로 승인할게요.';
  db.teams.demo={key:'demo',context:'market',refId:'m2',participants:['kim','oh'],pendingReplyFor:null,messages:[{id:'bot',from:'them',text:old,at:''},{id:'human',from:'me',senderId:'kim',text:old,at:''}]};
  db.teams.other={...db.teams.demo,key:'other',context:'handover',messages:[{id:'other',from:'them',text:old,at:''}]};
  const next=readStored({getItem:()=>JSON.stringify(db)})!;expect(next.teams.demo!.messages[0]!.text).toContain('최종 구매자로 등록');expect(next.teams.demo!.messages[0]!.text).not.toContain('승인');expect(next.teams.demo!.messages[1]!.text).toBe(old);expect(next.teams.other!.messages[0]!.text).toBe(old);expect(db.teams.demo.messages[0]!.text).toBe(old);
});
