import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env["CI"]);

export default defineConfig({
  forbidOnly: CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  reporter: "html",
  retries: CI ? 2 : 0,
  testDir: "./tests/e2e",
  use: {
    trace: "on-first-retry",
  },
  workers: CI ? 1 : undefined,
});
