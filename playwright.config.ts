import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env["CI"]);
const CI_RETRIES = 2;
const CI_WORKERS = 1;
const BASE_URL = CI ? "http://localhost:4173" : "http://localhost:5173";

export default defineConfig({
  forbidOnly: CI,
  fullyParallel: true,
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  reporter: "html",
  testDir: "./tests/e2e",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  webServer: {
    command: CI ? "vp preview" : "vp dev",
    reuseExistingServer: !CI,
    url: BASE_URL,
  },
  ...(CI ? { retries: CI_RETRIES, workers: CI_WORKERS } : {}),
});
