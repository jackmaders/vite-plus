import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env["CI"]);
const CI_RETRIES = 2;
const CI_WORKERS = 1;

const PLAYWRIGHT_BASE_URL = (process.env["PLAYWRIGHT_BASE_URL"] ?? "").trim();
const PLAYWRIGHT_TARGET = (process.env["PLAYWRIGHT_TARGET"] ?? "").trim();

const DEV_URL = "http://localhost:5173";
const PREVIEW_URL = "http://localhost:4173";

const usePreview = CI || PLAYWRIGHT_TARGET === "preview";
const localBaseUrl = usePreview ? PREVIEW_URL : DEV_URL;
const baseURL = PLAYWRIGHT_BASE_URL || localBaseUrl;

const webServer = {
  command: usePreview ? "vp run preview" : "vp run dev",
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
  reporter: CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html"]],
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
