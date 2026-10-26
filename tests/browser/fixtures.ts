import { test as base } from "@playwright/test";

const IGNORED_WARNINGS = [
  // Firefox internal layout engine warning triggered during client navigation / stylesheet eval
  "Layout was forced before the page was fully loaded",
];

const test = base.extend<{
  // oxlint-disable-next-line typescript/no-invalid-void-type -- Playwright auto fixture provides no value to tests.
  browserDiagnostics: void;
}>({
  browserDiagnostics: [
    async ({ page }, use, testInfo) => {
      const problems: string[] = [];

      page.on("console", (message) => {
        if (!["warning", "error"].includes(message.type())) {
          return;
        }

        const text = message.text();
        if (IGNORED_WARNINGS.some((pattern) => text.includes(pattern))) {
          return;
        }

        problems.push(`[console.${message.type()}] ${text}`);
      });

      page.on("pageerror", (error) => {
        problems.push(`[pageerror] ${error.message}`);
      });

      await use();

      if (problems.length > 0) {
        const report = problems.join("\n");
        await testInfo.attach("browser-diagnostics", {
          body: report,
          contentType: "text/plain",
        });

        throw new Error(`Browser warnings or errors detected:\n${report}`);
      }
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
export { test };
