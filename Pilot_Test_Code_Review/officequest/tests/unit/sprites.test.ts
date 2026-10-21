import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { SPRITES, SOURCE_PIXEL_HASHES, getSprite, spritePixels } from '@/components/pixel/sprites';
import { TIER_ORDER } from '@/lib/formulas';
describe('pixel-draw grid and original source gates',()=>{
 it.each(Object.keys(SPRITES))('%s has exact dimensions, valid palette, sufficient opaque pixels and original pixel hash',name=>{const s=SPRITES[name]!;expect(s.rows).toHaveLength(s.h);let opaque=0;for(const row of s.rows){expect(row).toHaveLength(s.w);for(const key of row){if(key!=='.'){expect(s.palette[key]).toMatch(/^#[0-9a-f]{6}$/i);opaque++;}}}expect(opaque/(s.w*s.h)).toBeGreaterThanOrEqual(.2);expect(createHash('sha256').update(spritePixels(s)).digest('hex')).toBe(SOURCE_PIXEL_HASHES[name]);});
 it('six tier characters differ and retain the 24x24 canvas',()=>{const hashes=TIER_ORDER.map(tier=>{const s=getSprite('character',tier);expect([s.w,s.h]).toEqual([24,24]);return spritePixels(s);});expect(new Set(hashes).size).toBe(6);});
 it('all six source head crops preserve 16x14 dimensions',()=>{for(const tier of TIER_ORDER){const s=getSprite('head',tier);expect([s.w,s.h]).toEqual([16,14]);}});
 it('all required props exist without external image assets',()=>{for(const name of ['coin','gem','star','scroll','slime','monitor','mug','book','pad','keyboard','vest','ticket','chair','house'])expect(SPRITES[name]).toBeDefined();});
});
