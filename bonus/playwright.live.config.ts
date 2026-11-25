import { defineConfig, devices } from '@playwright/test';

/** Used by `npx tsx bonus/generate-test.ts --run …` */
export default defineConfig({
  testDir: './generated',
  testMatch: '*.spec.ts',
  reporter: [['list']],
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    ...devices['Desktop Chrome'],
  },
});
