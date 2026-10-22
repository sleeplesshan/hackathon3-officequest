// Harness §0-6 / P0 사전 진단. 항상 exit 0. 결과: 콘솔 표 + docs/doctor.json
// 실패 원인을 "환경 / 레지스트리 / 브라우저 / 자산" 으로 나눠 다음 행동(§7 Blocker 번호)을 제안한다.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const cwd = process.cwd();
const out = [];
const add = (area, item, status, detail, next = '') => out.push({ area, item, status, detail, next });

// 1) 런타임
const [maj, min] = process.versions.node.split('.').map(Number);
add('env', 'node', maj > 20 || (maj === 20 && min >= 19) ? 'OK' : 'FAIL', process.versions.node, maj >= 20 ? '' : 'Node 22 LTS 설치 (§1.1)');
add('env', 'platform', 'INFO', `${process.platform}-${process.arch}`);

// 2) 레지스트리 (설치 실패를 네트워크/버전 문제로 구분)
try {
  const res = await fetch('https://registry.npmjs.org/next/15.5.28', { signal: AbortSignal.timeout(8000) });
  add('registry', 'registry.npmjs.org', res.ok ? 'OK' : 'WARN', `HTTP ${res.status}`, res.ok ? '' : 'B1');
} catch (err) {
  add('registry', 'registry.npmjs.org', 'WARN', String(err).slice(0, 120), 'B1: 오프라인이면 기존 node_modules 사용');
}

// 3) 설치 상태
const pkgOk = (name, version) => {
  const p = join(cwd, 'node_modules', name, 'package.json');
  if (!existsSync(p)) return add('install', name, 'FAIL', 'not installed', 'B1: npm install --prefer-online 재시도');
  const v = JSON.parse(readFileSync(p, 'utf8')).version;
  add('install', name, v === version ? 'OK' : 'FAIL', v, v === version ? '' : `§1.1 고정 버전 ${version}로 재설치`);
};
pkgOk('next', '15.5.28');
pkgOk('react', '19.1.10');
pkgOk('tinymce', '5.10.2');
pkgOk('@playwright/test', '1.64.1');

// 4) 브라우저 (Playwright 번들 → 시스템 Chrome/Edge 순)
let browser = null;
try {
  const { chromium } = await import('@playwright/test');
  const exe = chromium.executablePath();
  if (exe && existsSync(exe)) browser = { kind: 'bundled', path: exe };
} catch { /* not installed */ }
const sys = [
  ['chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
  ['msedge', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
  ['chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'],
  ['chrome', '/usr/bin/google-chrome'],
  ['exe', '/usr/bin/chromium'],
].find(([, p]) => existsSync(p));
if (browser) add('browser', 'playwright chromium', 'OK', browser.path);
else if (sys) add('browser', 'system browser', 'WARN', sys[1], sys[0] === 'exe' ? `B2: PW_EXECUTABLE_PATH="${sys[1]}"` : `B2: PW_CHANNEL=${sys[0]}`);
else add('browser', 'any chromium', 'FAIL', 'none found', 'B2: npx playwright install chromium → 실패 시 ENV-BLOCKED: browser');

// 5) 자산
const has = (p) => existsSync(join(cwd, p));
const tiny = has('public/tinymce/tinymce.min.js');
add('asset', 'public/tinymce/tinymce.min.js', tiny ? 'OK' : 'WARN', '', tiny ? '' : 'npm run postinstall → B3');
const fontDir = join(cwd, 'public', 'fonts', 'paperlogy');
const fonts = existsSync(fontDir) ? readdirSync(fontDir).filter((f) => f.endsWith('.woff2') && statSync(join(fontDir, f)).size > 1024) : [];
add('asset', 'public/fonts/paperlogy', fonts.length === 6 ? 'OK' : 'WARN', `${fonts.length}/6`, fonts.length === 6 ? '' : 'npm run fonts:fetch → B4');
const charDir = join(cwd, 'public', 'assets', 'character');
const chars = existsSync(charDir) ? readdirSync(charDir).filter((f) => /^(male|female)-(classic|wave)-(bronze|silver|gold|platinum|diamond|master)\.png$/.test(f)) : [];
add('asset', 'public/assets/character', chars.length === 24 ? 'OK' : 'WARN', `${chars.length}/24`, chars.length === 24 ? '' : 'cp ../../reference/assets/character/*.png public/assets/character/ → B26');
const tok = has('src/styles/tokens.css');
add('asset', 'src/styles/tokens.css', tok ? 'OK' : 'FAIL', '', tok ? '' : 'cp ../../tokens.css src/styles/tokens.css');
// 6) 실행기 (Harness §1.7): 앱 루트의 한 단계 위에 실행.command
const launcher = join(cwd, '..', '실행.command');
const launcherOk = existsSync(launcher) && (statSync(launcher).mode & 0o111) !== 0;
add('asset', '../실행.command', launcherOk ? 'OK' : 'WARN', '', launcherOk ? '' : '부록 A-16으로 작성 후 chmod +x "../실행.command" (§1.7)');

const summary = { at: new Date().toISOString(), fail: out.filter((r) => r.status === 'FAIL').length, warn: out.filter((r) => r.status === 'WARN').length, checks: out };
mkdirSync(join(cwd, 'docs'), { recursive: true });
writeFileSync(join(cwd, 'docs', 'doctor.json'), JSON.stringify(summary, null, 2));
for (const r of out) console.log(`[doctor] ${r.status.padEnd(4)} ${r.area}/${r.item} ${r.detail}${r.next ? `  -> ${r.next}` : ''}`);
console.log(`[doctor] FAIL ${summary.fail} · WARN ${summary.warn} (docs/doctor.json). 진단만 하며 항상 exit 0`);
