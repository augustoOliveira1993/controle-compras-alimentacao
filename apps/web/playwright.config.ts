import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:43100' },
  projects: [
    { name: 'desktop', use: devices['Desktop Chrome'] },
    { name: 'celular', use: devices['Pixel 7'] },
  ],
  webServer: [
    { command: 'pnpm --filter @compras/api start', env: { PORT: '43101' }, url: 'http://127.0.0.1:43101/api/v1/health' },
    { command: 'pnpm --filter @compras/web start', env: { PORT: '43100' }, url: 'http://127.0.0.1:43100' },
  ],
});
