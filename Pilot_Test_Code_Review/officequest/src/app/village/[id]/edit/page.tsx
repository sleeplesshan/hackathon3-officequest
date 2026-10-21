import VillageShell from '@/components/village/VillageShell';
import { ItemEdit } from '@/components/village/ItemForm';
export default async function EditItemPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <VillageShell><ItemEdit id={id}/></VillageShell>;}
