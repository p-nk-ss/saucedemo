import { defineConfig, devices } from '@playwright/test';
import { env, STORAGE_STATE } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: env.uiBaseUrl },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      testIgnore: /auth\.setup\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], baseURL: env.uiBaseUrl, storageState: STORAGE_STATE },
    },
    {
      name: 'api',
      testDir: './tests/api',
      // The service runs on a free dyno: cold starts and slow answers are expected.
      retries: process.env.CI ? 2 : 0,
      timeout: 60_000,
      use: { baseURL: env.apiBaseUrl, extraHTTPHeaders: { Accept: 'application/json' } },
    },
    // Tests written by the pipeline in `pipeline/`. They are not part of `npm test`.
    {
      name: 'generated-ui',
      testDir: './tests/generated/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], baseURL: env.uiBaseUrl, storageState: STORAGE_STATE },
    },
    {
      name: 'generated-api',
      testDir: './tests/generated/api',
      timeout: 60_000,
      use: { baseURL: env.apiBaseUrl, extraHTTPHeaders: { Accept: 'application/json' } },
    },
  ],
});
