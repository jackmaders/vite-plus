import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("renders the hero and feature highlights", async ({ page }) => {
    // Arrange & Act
    await page.goto("/");

    // Assert
    await expect(page).toHaveTitle("TanStack Start Starter");
    await expect(
      page.getByRole("heading", { level: 1, name: "Start simple, ship quickly." }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Type-Safe Routing" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Server Functions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Streaming by Default" })).toBeVisible();
  });

  test("navigates to the about page from the hero call to action", async ({ page }) => {
    // Arrange
    await page.goto("/");

    // Act
    await page.getByRole("link", { name: "About This Starter" }).click();

    // Assert
    await expect(page).toHaveURL(/\/about$/u);
    await expect(
      page.getByRole("heading", { level: 1, name: "A small starter with room to grow." }),
    ).toBeVisible();
  });
});
