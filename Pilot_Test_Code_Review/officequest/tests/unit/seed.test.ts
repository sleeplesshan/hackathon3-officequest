import { expect, it } from 'vitest';
import { getSeed } from '@/lib/db/seed';
import { restrictionStatus } from '@/lib/restrictions';
import { NOW, seed } from './domain-fixtures';

it('PRD §4 persona values and all cumulative rating seeds exactly match',()=>{
  const db=seed();
  const expected={kim:[1168,1500,0,23,99],lee:[650,300,1,8,33],park:[2740,5200,2,61,287],choi:[2360,4870,0,44,190],jung:[1850,2310,0,31,140],han:[560,1980,0,9,41],kang:[430,960,0,6,29],oh:[140,180,0,1,4],ops:[0,0,0,0,0]};
  for(const [id,values] of Object.entries(expected)){const u=db.users[id]!;expect([u.exp,u.points,u.completedToday,u.completedTotal,u.rating.sum]).toEqual(values);expect(u.rating.count).toBe(u.completedTotal);}
  expect(db.users.ops).toMatchObject({role:'admin',isPersona:true,name:'최운영 매니저',employeeNo:'HS13001',dept:'사내문화팀'});
  expect(Object.values(db.users).filter(u=>u.isPersona).map(u=>u.id).sort()).toEqual(['kim','lee','ops','park']);
});
it('PRD §9 quests: 7 rows, state distribution, escrow, submissions and ratings',()=>{
  const db=seed();expect(db.quests).toHaveLength(7);expect(db.quests.map(q=>q.no)).toEqual([7,6,5,4,3,2,1]);
  expect(['recruiting','in_progress','revision','done'].map(s=>db.quests.filter(q=>q.status===s).length)).toEqual([3,1,1,2]);
  expect(db.quests.map(q=>q.escrowHeld)).toEqual([300,50,500,400,150,0,0]);expect(db.counters.nextQuestNo).toBe(8);
  expect(db.quests.find(q=>q.no===4)).toMatchObject({rejectCount:1,status:'revision',reviewPending:false,workerId:'lee'});
  expect(db.quests.find(q=>q.no===7)?.applications.map(a=>a.userId)).toEqual(['lee','jung','oh']);
  expect(db.quests.filter(q=>q.status==='done').map(q=>q.rating?.stars)).toEqual([4,5]);
});
it('PRD §9 market: 8 rows, all 6 villages, 5/2/1 statuses, two free and 3 photos each',()=>{
  const db=seed();expect(db.items).toHaveLength(8);expect(new Set(db.items.map(i=>i.village)).size).toBe(6);
  expect(['available','reserved','sold'].map(s=>db.items.filter(i=>i.status===s).length)).toEqual([5,2,1]);
  expect(db.items.filter(i=>i.mode==='free').map(i=>[i.id,i.price])).toEqual([['m2',0],['m6',0]]);
  for(const item of db.items)expect(item.photos).toHaveLength(3);
  expect(db.items.find(i=>i.id==='m2')?.reservedFor).toBe('lee'); expect(db.items.find(i=>i.id==='m3')?.reservedFor).toBe('kim');
  expect(db.items.find(i=>i.id==='m8')).toMatchObject({buyerId:'kang',sellerId:'han',price:600,status:'sold'});
});
it('PRD §9 archived evidence is ledger-only and balances end at seeded points',()=>{
  const db=seed();expect(db.ratings).toHaveLength(9);expect(db.ratings.filter(r=>r.archived)).toHaveLength(7);
  expect(db.ratings.map(r=>r.id)).toEqual(['rt1','rt2','rt3','rt4','rt5','rt6','rt7','rt8','rt9']);
  expect(db.quests.some(q=>String(q.no).startsWith('A-'))).toBe(false);expect(db.items.some(i=>i.id.startsWith('A-'))).toBe(false);
  expect(db.restrictions).toHaveLength(1);expect(restrictionStatus(db.restrictions[0]!,NOW)).toBe('lifted');expect(db.adminLog).toHaveLength(2);
  expect(db.counters).toMatchObject({nextRestrictionNo:2,nextLogNo:3});expect(db.flagStates).toEqual({});
  for(const user of Object.values(db.users)){
    const tx=db.transactions.filter(t=>t.userId===user.id).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
    if(tx.length)expect(tx.at(-1)!.balanceAfter).toBe(user.points);
    for(const t of tx)expect(t.balanceAfter).toBeGreaterThanOrEqual(0);
  }
});
it('seed is deterministic, independently allocated, and archive offsets follow seedNow',()=>{
  const a=getSeed(NOW),b=getSeed(NOW);expect(a).toEqual(b);a.users.kim!.points=0;expect(b.users.kim!.points).toBe(1500);
  const later=getSeed(NOW+86400000);for(const r of b.ratings.filter(r=>r.archived))expect(Date.parse(later.ratings.find(x=>x.id===r.id)!.approvedAt)-Date.parse(r.approvedAt)).toBe(86400000);
});
