// tokens.css의 Paperlogy woff2 URL 6개를 public/fonts/paperlogy/에 같은 파일명으로 저장. 실패해도 exit 0.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src', 'styles', 'tokens.css'), 'utf8');
const urls = [...new Set([...css.matchAll(/url\('([^']+Paperlogy-[^']+\.woff2)'\)/g)].map((m) => m[1]))];
const dest = join(process.cwd(), 'public', 'fonts', 'paperlogy');
mkdirSync(dest, { recursive: true });
let ok = 0;
for (const url of urls) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(join(dest, basename(url)), Buffer.from(await res.arrayBuffer()));
    ok += 1;
  } catch (err) {
    console.warn(`[fetch-fonts] skip ${url}: ${String(err)}`);
  }
}
console.log(`[fetch-fonts] ${ok}/${urls.length} saved to public/fonts/paperlogy`);
