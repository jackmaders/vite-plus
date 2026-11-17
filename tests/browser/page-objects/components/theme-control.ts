import type { Locator, Page } from "@playwright/test";

export class ThemeControl {
  public readonly button: Locator;
  public readonly document: Locator;
  public readonly navbar: Locator;
  public readonly menu: Locator;

  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
    this.navbar = page.getByRole("banner");
    this.menu = this.navbar.getByRole("button", { name: "Open menu" });
    this.button = this.navbar.getByRole("button", { name: /^Theme:/u });
    this.document = page.getByRole("document");
  }

  public async cycle() {
    await this.button.click();
  }

  public async activateWithEnter() {
    await this.button.press("Enter");
  }

  public async activateWithSpace() {
    await this.button.press("Space");
  }

  public async chooseDark() {
    await this.cycle();
    await this.cycle();
  }

  public async isHydrated() {
    return await this.page.evaluate(() => document.body.dataset["hydrated"] === "true");
  }

  public async iconClass() {
    return await this.button.evaluate((button) =>
      button.querySelector("svg")?.getAttribute("class"),
    );
  }
}
