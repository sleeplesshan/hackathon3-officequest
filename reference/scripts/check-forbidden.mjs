// Harness §5.5 금지 패턴 검사 (v2.5). 대상: src/** (src/styles/tokens.css 제외). 위반 시 exit 1.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(process.cwd(), 'src');
const SKIP = new Set([join('src', 'styles', 'tokens.css')]);
const BRAND_OK = new Set([join('src', 'lib', 'brand.ts')]); // 캔버스용 BRAND 상수 (DESIGN §3.0)
const BRAND_HEX = /#(?:2E008B|3D00B8|6428E6|875FF0|C4C4E6|F1F1F9|FFBE19)(?![0-9a-f])/i;
// v2.5: hyosung.sharepoint.com 제거 (PRD D70: 시연 첨부는 URL을 만들지 않음)
const URL_ALLOW = ['fastly.jsdelivr.net', 'www.w3.org', 'localhost'];
// v2.5 규칙 12: Tailwind 유틸리티와 이름이 겹치는 커스텀 CSS 클래스 선택자 (Harness §1.6-9)
const TW_CLASH = /(?:^|[\s,}>+~(])\.(ring|shadow|container|hidden|block|inline|flex|grid|table|border|rounded|truncate|blur|filter|transform|transition|outline|underline|italic|uppercase|lowercase|capitalize|static|fixed|absolute|relative|sticky|visible|invisible|collapse|contents|grow|shrink|isolate|sr-only|antialiased|ease-in|ease-out|ease-linear|animate-spin|animate-pulse|prose)(?=[\s,{:.\[>+~)])/m;

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|css|mjs|js)$/.test(name)) files.push(p);
  }
})(ROOT);

const rules = [
  { id: 1, name: 'Tiny Cloud / API key', re: /tiny\.cloud|apiKey\s*=/ },
  { id: 3, name: 'empty onClick handler', re: /onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/ },
  { id: 4, name: 'retired cyan #06B6D4 (PRD D2)', re: /#06B6D4/i },
  { id: 5, name: 'Math.random (use mulberry32)', re: /Math\.random\(/ },
  { id: 6, name: 'emoji / pictographic symbol (use Lucide)', re: /\p{Extended_Pictographic}/u },
  { id: 8, name: 'console.log', re: /console\.log\(/ },
  { id: 9, name: 'external <img src="http', re: /<img[^>]+src=["']https?:/ },
  { id: 10, name: 'browser storage/channel at module top level', re: /^(?:export\s+)?const\s+\w+\s*=\s*(?:window\.)?(?:localStorage|sessionStorage|new BroadcastChannel)/m },
  { id: 13, name: 'audio file / new Audio (use Web Audio synth, PRD D71)', re: /new Audio\(|\.(?:mp3|wav|ogg|m4a)['"`]/ },
];

const violations = [];
for (const file of files) {
  const rel = relative(process.cwd(), file);
  if (SKIP.has(rel)) continue;
  const text = readFileSync(file, 'utf8');
  for (const r of rules) {
    const m = text.match(r.re);
    if (m) violations.push(`${rel}: [${r.id}] ${r.name} -> ${JSON.stringify(m[0].slice(0, 60))}`);
  }
  if (!BRAND_OK.has(rel)) {
    const b = text.match(BRAND_HEX);
    if (b) violations.push(`${rel}: [11] brand hex outside tokens (use var(--hs-*) or BRAND) -> ${b[0]}`);
  }
  if (rel.endsWith('.css')) {
    const c = text.replace(/\/\*[\s\S]*?\*\//g, '').match(TW_CLASH);
    if (c) violations.push(`${rel}: [12] custom class collides with Tailwind utility (rename with a component prefix) -> .${c[1]}`);
  }
  for (const m of text.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)/g)) {
    if (!URL_ALLOW.includes(m[1])) violations.push(`${rel}: [2] URL host not allowed -> ${m[1]}`);
  }
  for (const m of text.matchAll(/font-family\s*:\s*([^;}{]+)/g)) {
    const first = m[1].trim().split(',')[0].replace(/['"]/g, '').trim();
    if (!/^(Paperlogy|var\(--font-sans\)|inherit)$/.test(first)) violations.push(`${rel}: [7] font-family first face is ${first}`);
  }
}
if (violations.length) { console.error(violations.join('\n')); console.error(`[qa:forbidden] ${violations.length} violation(s)`); process.exit(1); }
console.log(`[qa:forbidden] OK (${files.length} files)`);
