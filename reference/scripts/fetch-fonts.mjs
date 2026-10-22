// tokens.css의 Paperlogy CDN woff2 URL 6개를 public/fonts/paperlogy/에 같은 파일명으로 저장.
// 로컬 경로(/fonts/...)는 건너뛰고 https URL만 받는다. 이미 있으면 다시 받지 않음. 실패해도 exit 0 (Harness B4).
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src', 'styles', 'tokens.css'), 'utf8');
const urls = [...new Set([...css.matchAll(/url\('(https:\/\/[^']+Paperlogy-[^']+\.woff2)'\)/g)].map((m) => m[1]))];
const dest = join(process.cwd(), 'public', 'fonts', 'paperlogy');
mkdirSync(dest, { recursive: true });
let ok = 0;
for (const url of urls) {
  const file = join(dest, basename(url));
  if (existsSync(file) && statSync(file).size > 1024) { ok += 1; continue; }
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      ok += 1;
      break;
    } catch (err) {
      if (attempt === 3) console.warn(`[fetch-fonts] skip ${url}: ${String(err)}`);
    }
  }
}
// SIL OFL 1.1: 폰트 파일을 저장소에 함께 배포할 때 저작권·라이선스 안내를 같이 둔다.
const notice = join(dest, 'OFL.txt');
if (ok > 0 && !existsSync(notice)) {
  writeFileSync(notice, 'Paperlogy\nCopyright 2024 The PAPERLOGY Authors (https://freesentation.blog/paperlogy)\n'
    + 'This Font Software is licensed under the SIL Open Font License, Version 1.1.\n'
    + 'Full license text: https://openfontlicense.org/open-font-license-official-text/\n');
}
console.log(`[fetch-fonts] ${ok}/${urls.length} present in public/fonts/paperlogy`);
