import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env["CI"]);
const CI_RETRIES = 2;
const CI_WORKERS = 1;

const PLAYWRIGHT_BASE_URL = (process.env["PLAYWRIGHT_BASE_URL"] ?? "").trim();
const EXPLICIT_PLAYWRIGHT_PORT = (process.env["PLAYWRIGHT_PORT"] ?? "").trim();
const PLAYWRIGHT_PORT = EXPLICIT_PLAYWRIGHT_PORT || "4173";
const PREVIEW_URL = `http://localhost:${PLAYWRIGHT_PORT}`;

const baseURL = PLAYWRIGHT_BASE_URL || PREVIEW_URL;

const webServer = {
  command: `vp preview --port ${PLAYWRIGHT_PORT}`,
  env: {
    BETTER_AUTH_SECRET: process.env["BETTER_AUTH_SECRET"] ?? "template-ci-local-only-secret-value",
    BETTER_AUTH_URL: process.env["BETTER_AUTH_URL"] ?? PREVIEW_URL,
  },
  reuseExistingServer: !CI && EXPLICIT_PLAYWRIGHT_PORT.length === 0,
  stderr: "ignore" as const,
  stdout: "ignore" as const,
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
  testDir: "./tests/browser",
  testMatch: "**/*.test.ts",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: CI ? "on-first-retry" : "retain-on-failure",
  },
  ...(PLAYWRIGHT_BASE_URL ? {} : { webServer }),
  ...(CI ? { retries: CI_RETRIES, workers: CI_WORKERS } : {}),
});
