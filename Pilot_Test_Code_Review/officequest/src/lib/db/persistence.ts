import { MARKET_BUYER_GUIDANCE } from '@/lib/teams-replies';
import type { DB } from '@/lib/types';
export type StoredDB = DB & { rev: number };
export function readStored(storage: Pick<Storage, 'getItem'>): StoredDB | null {
  try {
    const value = JSON.parse(storage.getItem('oq:v1:db') ?? 'null');
    if (value?.schemaVersion !== 1 || !value.users?.ops || !value.daily || !value.timer || !value.counters || !value.season || !value.teams || !value.flagStates || !Array.isArray(value.restrictions) || !Array.isArray(value.adminLog) || !Array.isArray(value.transactions) || !Array.isArray(value.notifications) || !Array.isArray(value.ratings) || !Array.isArray(value.quests) || !Array.isArray(value.items)) return null;
    // Existing demo saves may contain links from the original specification.
    for (const quest of value.quests as DB['quests']) {
      const files=[...(quest.attachments??[]),...(quest.submissions??[]).flatMap(s=>s.attachments??[]),...(quest.answers??[]).flatMap(a=>a.attachments??[])];
      for(const file of files)if(file.kind==='sharepoint')delete file.url;
    }
    // Refresh only the exact canned market reply; preserve user messages.
    for(const thread of Object.values(value.teams) as DB['teams'][string][])if(thread.context==='market')for(const message of thread.messages){
      if(message.from==='them'&&message.text==='[샀어요] 눌러주시면 바로 승인할게요.')message.text=MARKET_BUYER_GUIDANCE;
    }
    return { ...value, rev: Number.isFinite(value.rev) ? value.rev : 0 };
  } catch { return null; }
}
export function saveStored(storage: Pick<Storage, 'setItem'>, db: DB, rev: number): void { storage.setItem('oq:v1:db', JSON.stringify({ ...db, rev })); }
