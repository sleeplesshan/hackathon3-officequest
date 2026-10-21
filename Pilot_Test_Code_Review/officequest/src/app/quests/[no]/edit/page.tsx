import { AppShell } from '@/components/shell/AppShell';
import QuestDetail from '@/components/quest/QuestDetail';
export default async function Page({params}:{params:Promise<{no:string}>}){const {no}=await params;return <AppShell sidebar><QuestDetail no={Number(no)} edit/></AppShell>;}
