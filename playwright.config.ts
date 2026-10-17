import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env["CI"]);
const CI_RETRIES = 2;
const CI_WORKERS = 1;

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
  use: { trace: "on-first-retry" },
  ...(CI ? { retries: CI_RETRIES, workers: CI_WORKERS } : {}),
});
