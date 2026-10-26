import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

class ErrorTestPage {
  public readonly knownErrorButton: Locator;
  public readonly unexpectedErrorButton: Locator;
  public readonly defaultErrorToastButton: Locator;
  public readonly unexpectedErrorToastButton: Locator;
  public readonly inlineMutationErrorButton: Locator;
  public readonly serverResponseStatus: Locator;
  public readonly inlineAlert: Locator;
  public readonly dialogs: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.knownErrorButton = page.getByRole("button", {
      exact: true,
      name: "Trigger known error",
    });
    this.unexpectedErrorButton = page.getByRole("button", {
      exact: true,
      name: "Trigger unexpected error",
    });
    this.defaultErrorToastButton = page.getByRole("button", {
      exact: true,
      name: "Trigger default error toast",
    });
    this.unexpectedErrorToastButton = page.getByRole("button", {
      exact: true,
      name: "Trigger unexpected error toast",
    });
    this.inlineMutationErrorButton = page.getByRole("button", {
      exact: true,
      name: "Trigger inline mutation error",
    });
    this.serverResponseStatus = page.getByRole("status", {
      name: "Server error response",
    });
    this.inlineAlert = page.getByRole("alert");
    this.dialogs = page.getByRole("dialog");
  }

  public async goto() {
    await this.page.goto("/error-test");
    await waitForHydration(this.page);
  }

  public async triggerKnownError() {
    const responsePromise = this.page.waitForResponse((response) =>
      response.url().includes("/_serverFn/"),
    );
    await this.knownErrorButton.click();
    return await responsePromise;
  }

  public async triggerUnexpectedError() {
    const responsePromise = this.page.waitForResponse((response) =>
      response.url().includes("/_serverFn/"),
    );
    await this.unexpectedErrorButton.click();
    return await responsePromise;
  }

  public async triggerDefaultErrorToast() {
    await this.defaultErrorToastButton.click();
  }

  public async triggerUnexpectedErrorToast() {
    await this.unexpectedErrorToastButton.click();
  }

  public async triggerInlineMutationError() {
    await this.inlineMutationErrorButton.click();
  }

  public getToastDialog(title: string): Locator {
    return this.page.getByRole("dialog", { name: title });
  }
}

export { ErrorTestPage };
