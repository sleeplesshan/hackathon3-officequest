import VillageShell from '@/components/village/VillageShell';
import ItemDetail from '@/components/village/ItemDetail';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <VillageShell><ItemDetail id={id}/></VillageShell>;}
