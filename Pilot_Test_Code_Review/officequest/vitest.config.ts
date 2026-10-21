import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// 단위 테스트 시간대 고정(PRD §0.3 KST). OS 시간대(UTC CI 등)와 무관하게 같은 결과. Windows에서도 동작(npm 스크립트의 TZ= 접두어 대신).
process.env.TZ = 'Asia/Seoul';

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node', env: { TZ: 'Asia/Seoul' } },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
