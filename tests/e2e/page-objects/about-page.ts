import type { Locator, Page } from "@playwright/test";

class AboutPage {
  public readonly heading: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", {
      level: 1,
      name: "A small starter with room to grow.",
    });
  }

  public async goto() {
    await this.page.goto("/about");
  }
}

export { AboutPage };
