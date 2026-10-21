// node_modules/tinymce → public/tinymce (TinyMCE 5.10.2 셀프호스팅). 실패해도 설치를 막지 않음(exit 0).
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const src = join(process.cwd(), 'node_modules', 'tinymce');
const dest = join(process.cwd(), 'public', 'tinymce');
try {
  if (!existsSync(join(src, 'tinymce.min.js'))) throw new Error('node_modules/tinymce/tinymce.min.js not found');
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  for (const entry of ['tinymce.min.js', 'icons', 'plugins', 'skins', 'themes', 'license.txt']) {
    const from = join(src, entry);
    if (existsSync(from)) cpSync(from, join(dest, entry), { recursive: true });
  }
  console.log('[copy-tinymce] copied to public/tinymce');
} catch (err) {
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, '.missing'), String(err));
  console.warn('[copy-tinymce] FAILED, FallbackEditor will be used:', String(err));
}
