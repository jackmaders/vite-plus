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
  await expect(page.getByRole("status")).toHaveText("TODO_NOT_FOUND: Todo item not found. (404)");
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
  await expect(page.getByRole("status")).toHaveText(
    "INTERNAL_SERVER_ERROR: Something went wrong. (500)",
  );
  expect(response.request().method()).toBe("GET");
  expect(body).toContain("INTERNAL_SERVER_ERROR");
  expect(body).not.toMatch(/private|stack|cause|details/u);
});
