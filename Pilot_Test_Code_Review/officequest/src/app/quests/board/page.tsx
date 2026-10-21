import { Suspense } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import QuestBoard from '@/components/quest/QuestBoard';
export default function QuestBoardPage(){return <AppShell sidebar><Suspense fallback={<div className="card quest-board" aria-busy="true"/>}><QuestBoard/></Suspense></AppShell>;}
