'use client';
import { useCallback } from 'react';
import { playHyperFrame } from '@/lib/test-hooks';
export function useHyperFrame(){return useCallback(playHyperFrame,[]);}
export default useHyperFrame;
