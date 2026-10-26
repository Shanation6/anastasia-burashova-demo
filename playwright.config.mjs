import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:4174/site/', channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true, trace: 'retain-on-failure' },
  webServer: { command: 'python -m http.server 4174 --bind 127.0.0.1', url: 'http://127.0.0.1:4174/site/', reuseExistingServer: true },
});
