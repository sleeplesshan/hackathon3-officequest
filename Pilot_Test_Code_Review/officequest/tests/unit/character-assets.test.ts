import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { characterAsset, OUTFITS } from '../../src/lib/character';
describe('original pixel style asset contract',()=>{
 it('all 24 gender/hair/outfit combinations have native 24x24 PNGs with distinct outputs',()=>{
  const hashes=new Set<string>();
  for(const gender of ['male','female'] as const)for(const hair of ['classic','wave'] as const)for(const outfit of OUTFITS){
   const path=`public${characterAsset({gender,hair},outfit.id)}`;const png=readFileSync(path);
   expect(png.subarray(1,4).toString()).toBe('PNG');expect([png.readUInt32BE(16),png.readUInt32BE(20)],path).toEqual([24,24]);
   hashes.add(createHash('sha256').update(png).digest('hex'));
  }
  expect(hashes.size).toBe(24);
 });
});
