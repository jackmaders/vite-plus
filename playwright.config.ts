import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env["CI"]);
const CI_RETRIES = 2;
const CI_WORKERS = 1;

const PLAYWRIGHT_BASE_URL = (process.env["PLAYWRIGHT_BASE_URL"] ?? "").trim();
const PREVIEW_URL = "http://localhost:4173";

const baseURL = PLAYWRIGHT_BASE_URL || PREVIEW_URL;

const webServer = {
  command: "vp preview",
  reuseExistingServer: !CI,
  url: baseURL,
};

export default defineConfig({
  forbidOnly: CI,
  fullyParallel: true,
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  reporter: CI ? "github" : "list",
  testDir: "./tests/e2e",
  testMatch: "**/*.test.ts",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: CI ? "on-first-retry" : "retain-on-failure",
  },
  ...(PLAYWRIGHT_BASE_URL ? {} : { webServer }),
  ...(CI ? { retries: CI_RETRIES, workers: CI_WORKERS } : {}),
});
