'use client';
import { useDb } from '@/lib/db/DbProvider';
export function useNow(_interval = 1000) { void _interval; return useDb().now; }
