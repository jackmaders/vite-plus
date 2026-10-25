/* oxlint-disable import/no-nodejs-modules, node/no-sync -- Playwright configuration runs in Node and prepares bindings before starting preview. */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { defineConfig, devices } from "@playwright/test";
import { z } from "zod";

const CI = Boolean(process.env["CI"]);
const CI_RETRIES = 2;
const CI_WORKERS = 1;

const PLAYWRIGHT_BASE_URL = (process.env["PLAYWRIGHT_BASE_URL"] ?? "").trim();
const PREVIEW_URL = "http://localhost:4173";

const baseURL = PLAYWRIGHT_BASE_URL || PREVIEW_URL;

if (!PLAYWRIGHT_BASE_URL) {
  const deployConfigPath = path.resolve(".wrangler/deploy/config.json");
  const deployConfig = z
    .object({ configPath: z.string() })
    .parse(JSON.parse(readFileSync(deployConfigPath, "utf8")));
  const workerDirectory = path.dirname(
    path.resolve(path.dirname(deployConfigPath), deployConfig.configPath),
  );
  // Preview reads Worker bindings beside the built config rather than from process.env.
  writeFileSync(
    path.resolve(workerDirectory, ".dev.vars"),
    `BETTER_AUTH_URL=${JSON.stringify(baseURL)}\nBETTER_AUTH_SECRET="playwright-local-only-secret-value"\n`,
    { mode: 0o600 },
  );
}

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
