import { test as base, type ConsoleMessage } from "@playwright/test";

const IGNORED_WARNINGS = [
  // Firefox internal layout engine warning triggered during client navigation / stylesheet eval
  "Layout was forced before the page was fully loaded",
];

interface BrowserDiagnostics {
  readonly problems: readonly string[];
}

const test = base.extend<{
  browserDiagnostics: BrowserDiagnostics;
}>({
  browserDiagnostics: [
    async ({ page }, use, testInfo) => {
      const problems: string[] = [];

      page.on("console", async (message) => {
        if (!["warning", "error"].includes(message.type())) {
          return;
        }

        const text = await readConsoleMessage(message);
        if (IGNORED_WARNINGS.some((pattern) => text.includes(pattern))) {
          return;
        }

        problems.push(`[console.${message.type()}] ${text}`);
      });

      page.on("pageerror", (error) => {
        problems.push(`[pageerror] ${error.message}`);
      });

      await use({ problems });

      const expectedConsoleErrors = testInfo.annotations
        .filter(({ type }) => type === "expected-console-error")
        .map(({ description }) => description ?? "");
      const unexpectedProblems = problems.filter(
        (problem) => !expectedConsoleErrors.some((expected) => problem.includes(expected)),
      );

      if (unexpectedProblems.length > 0) {
        const report = unexpectedProblems.join("\n");
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

async function readConsoleMessage(message: ConsoleMessage) {
  const argumentTexts = await Promise.all(
    message.args().map(async (argument) => await readConsoleArgument(argument)),
  );

  return [message.text(), ...argumentTexts].filter((text) => text.length > 0).join(" ");
}

async function readConsoleArgument(argument: ReturnType<ConsoleMessage["args"]>[number]) {
  try {
    return await argument.evaluate((value: unknown) => {
      if (typeof value !== "object" || value === null) {
        return String(value);
      }

      if (
        "name" in value &&
        typeof value.name === "string" &&
        "message" in value &&
        typeof value.message === "string"
      ) {
        return `${value.name}: ${value.message}`;
      }

      return JSON.stringify(value);
    });
  } catch {
    return "";
  }
}

export { expect } from "@playwright/test";
export { test };
