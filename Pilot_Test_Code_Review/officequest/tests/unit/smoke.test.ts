import { describe, expect, it } from 'vitest';
import { now } from '@/lib/clock';

describe('P0 smoke', () => {
  it('clock.now returns epoch ms', () => {
    expect(now()).toBeGreaterThan(0);
  });
  it('unit tests run in Asia/Seoul', () => {
    expect(new Date('2026-10-21T05:02:48Z').getHours()).toBe(14);
  });
});
