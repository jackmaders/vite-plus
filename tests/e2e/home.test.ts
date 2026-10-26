import { expect, test } from "@playwright/test";

import { AboutPage, HomePage } from "./page-objects";

test.describe("home page", () => {
  test("renders the hero and feature highlights", async ({ page }) => {
    // Arrange & Act
    const homePage = new HomePage(page);
    await homePage.goto();

    // Assert
    await expect(page).toHaveTitle("TanStack Start Starter");
    await expect(homePage.heading).toBeVisible();
    await expect(homePage.typeSafeRoutingHeading).toBeVisible();
    await expect(homePage.serverFunctionsHeading).toBeVisible();
    await expect(homePage.streamingByDefaultHeading).toBeVisible();
  });

  test("navigates to the about page from the hero call to action", async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    const aboutPage = new AboutPage(page);
    await homePage.goto();

    // Act
    await homePage.clickAboutLink();

    // Assert
    await expect(page).toHaveURL(/\/about$/u);
    await expect(aboutPage.heading).toBeVisible();
  });
});
