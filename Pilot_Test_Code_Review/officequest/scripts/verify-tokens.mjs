// src/styles/tokens.css 가 저장소 루트 tokens.css 와 바이트 단위로 같은지 검사.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), '..', 'tokens.css');
const copy = join(process.cwd(), 'src', 'styles', 'tokens.css');
if (!existsSync(root)) { console.warn('[verify-tokens] ../tokens.css not found (MISSING) - skipped'); process.exit(0); }
if (!existsSync(copy)) { console.error('[verify-tokens] src/styles/tokens.css missing. Run: cp ../tokens.css src/styles/tokens.css'); process.exit(1); }
if (!readFileSync(root).equals(readFileSync(copy))) { console.error('[verify-tokens] src/styles/tokens.css differs from ../tokens.css'); process.exit(1); }
console.log('[verify-tokens] OK');
