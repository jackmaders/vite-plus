import { expect, test } from "@playwright/test";

test("returns a safe known error from the actual server function", async ({ page }) => {
  // Arrange
  await page.goto("/error-test");
  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("/_serverFn/"),
  );

  // Act
  await page.getByRole("button", { exact: true, name: "Trigger known error" }).click();
  const response = await responsePromise;
  const body = await response.text();

  // Assert
  await expect(page.getByRole("status", { name: "Server error response" })).toHaveText(
    "TODO_NOT_FOUND: Todo item not found. (404)",
  );
  expect(response.request().method()).toBe("POST");
  expect(body).toContain("TODO_NOT_FOUND");
  expect(body).not.toMatch(/private|stack|cause|details/u);
});

test("returns a generic application error for an unexpected failure", async ({ page }) => {
  // Arrange
  await page.goto("/error-test");
  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("/_serverFn/"),
  );

  // Act
  await page.getByRole("button", { exact: true, name: "Trigger unexpected error" }).click();
  const response = await responsePromise;
  const body = await response.text();

  // Assert
  await expect(page.getByRole("status", { name: "Server error response" })).toHaveText(
    "INTERNAL_SERVER_ERROR: Something went wrong. (500)",
  );
  expect(response.request().method()).toBe("GET");
  expect(body).toContain("INTERNAL_SERVER_ERROR");
  expect(body).not.toMatch(/private|stack|cause|details/u);
});

test("shows a default notification for a failed API mutation", async ({ page }) => {
  // Arrange
  await page.goto("/error-test");

  // Act
  await page.getByRole("button", { exact: true, name: "Trigger default error toast" }).click();

  // Assert
  await expect(page.getByRole("dialog", { name: "Todo item not found." })).toHaveCount(1);
  await expect(page.getByRole("dialog")).not.toContainText("private");
});

test("uses the safe generic message for an unexpected API failure", async ({ page }) => {
  // Arrange
  await page.goto("/error-test");

  // Act
  await page.getByRole("button", { exact: true, name: "Trigger unexpected error toast" }).click();

  // Assert
  await expect(page.getByRole("dialog", { name: "Something went wrong." })).toBeVisible();
  await expect(page.getByRole("dialog")).not.toContainText("private");
});

test("shows the default toast alongside inline API feedback", async ({ page }) => {
  // Arrange
  await page.goto("/error-test");

  // Act
  await page.getByRole("button", { exact: true, name: "Trigger inline mutation error" }).click();

  // Assert
  await expect(page.getByRole("alert")).toHaveText("Todo item not found.");
  await expect(page.getByRole("dialog", { name: "Todo item not found." })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(1);
});
