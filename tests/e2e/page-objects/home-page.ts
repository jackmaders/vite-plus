import type { Locator, Page } from "@playwright/test";

import { waitForHydration } from "./hydration";

class HomePage {
  public readonly heading: Locator;
  public readonly typeSafeRoutingHeading: Locator;
  public readonly serverFunctionsHeading: Locator;
  public readonly streamingByDefaultHeading: Locator;
  public readonly aboutLink: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", {
      level: 1,
      name: "Start simple, ship quickly.",
    });
    this.typeSafeRoutingHeading = page.getByRole("heading", { name: "Type-Safe Routing" });
    this.serverFunctionsHeading = page.getByRole("heading", { name: "Server Functions" });
    this.streamingByDefaultHeading = page.getByRole("heading", { name: "Streaming by Default" });
    this.aboutLink = page.getByRole("link", { name: "About This Starter" });
  }

  public async goto() {
    await this.page.goto("/");
    await waitForHydration(this.page);
  }

  public async clickAboutLink() {
    await this.aboutLink.click();
  }
}

export { HomePage };
