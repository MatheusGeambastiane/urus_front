import { defineConfig, devices } from "@playwright/test";

const appPort = 3100;
const apiPort = 4100;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://127.0.0.1:${appPort}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "pt-BR",
    timezoneId: "America/Bahia",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `node tests/e2e/support/mock-api.mjs --port=${apiPort}`,
      port: apiPort,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: `npm run dev -- --hostname 127.0.0.1 --port ${appPort}`,
      port: appPort,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_DIST_DIR: ".next-e2e",
        NEXT_PUBLIC_API_URL: `http://127.0.0.1:${apiPort}`,
        NEXTAUTH_URL: `http://127.0.0.1:${appPort}`,
        NEXTAUTH_SECRET: "e2e-only-secret-not-used-outside-tests",
        GOOGLE_CLIENT_ID: "e2e-google-client",
        GOOGLE_CLIENT_SECRET: "e2e-google-secret",
      },
    },
  ],
});
