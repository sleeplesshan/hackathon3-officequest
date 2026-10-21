'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import Dashboard from '@/components/dashboard/Dashboard';
import { useDb } from '@/lib/db/DbProvider';
export default function Home(){const {user}=useDb(),router=useRouter();useEffect(()=>{if(user?.role==='admin')router.replace('/admin');},[user?.role,router]);return <AppShell className="dashboard-shell">{user?.role==='admin'?<div aria-busy="true" className="card pad">운영자 콘솔로 이동하고 있어요...</div>:<Dashboard/>}</AppShell>;}
