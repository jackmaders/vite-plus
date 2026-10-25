import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: Boolean(process.env["CI"]),
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  testDir: "./tests/e2e",
  testMatch: "error-transport.test.ts",
  use: { baseURL: "http://127.0.0.1:4177", trace: "retain-on-failure" },
  webServer: {
    command:
      "vp build --config tests/transport/vite.config.ts && vp preview --config tests/transport/vite.config.ts --host 127.0.0.1 --port 4177",
    env: { NODE_ENV: "production" },
    url: "http://127.0.0.1:4177",
  },
});
