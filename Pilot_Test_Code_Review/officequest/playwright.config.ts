import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PORT_E2E ?? 3100);
const channel = process.env.PW_CHANNEL || undefined; // 'chrome' | 'msedge' (Harness §7 B2)
const executablePath = process.env.PW_EXECUTABLE_PATH || undefined;

export default defineConfig({
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 6_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel,
    launchOptions: { executablePath },
  },
  // 빌드는 npm 스크립트(test:e2e / test:visual)가 항상 먼저 수행. 여기서는 서버만 띄움.
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'e2e', testDir: 'tests/e2e', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'visual', testDir: 'tests/visual', use: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 } },
  ],
});
