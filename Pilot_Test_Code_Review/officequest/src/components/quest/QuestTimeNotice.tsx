'use client';
import Link from 'next/link';
import { Clock3, Send, Pencil } from 'lucide-react';
import { QUEST_TIME_NOTICE } from '@/lib/quest-access';
export default function QuestTimeNotice() {
  return <section className="card quest-time-notice" data-testid="quest-time-locked" role="status">
    <span className="quest-time-icon"><Clock3 size={30}/></span><p className="quest-time-eyebrow">TODAY’S QUEST TIME IS OVER</p>
    <h1>{QUEST_TIME_NOTICE}</h1><p>업무 퀘스트 게시판은 내일 다시 열려요.<br/>내가 참여하거나 요청한 퀘스트는 계속 확인할 수 있어요.</p>
    <div><Link prefetch={false} href="/quests/board?mine=applied" className="btn pri"><Send size={16}/>내가 참여한 퀘스트</Link><Link prefetch={false} href="/quests/board?mine=requested" className="btn"><Pencil size={16}/>내가 요청한 퀘스트</Link></div>
  </section>;
}
