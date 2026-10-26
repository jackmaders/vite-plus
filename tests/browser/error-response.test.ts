import { expect, test } from "./fixtures";
import { ErrorTestPage } from "./page-objects";

test("returns a safe known error from the actual server function", async ({ page }) => {
  // Arrange
  const errorTestPage = new ErrorTestPage(page);
  await errorTestPage.goto();

  // Act
  const response = await errorTestPage.triggerKnownError();
  const body = await response.text();

  // Assert
  await expect(errorTestPage.serverResponseStatus).toHaveText(
    "TODO_NOT_FOUND: Todo item not found. (404)",
  );
  expect(response.request().method()).toBe("POST");
  expect(body).toContain("TODO_NOT_FOUND");
  expect(body).not.toMatch(/private|stack|cause|details/u);
});

test("returns a generic application error for an unexpected failure", async ({ page }) => {
  // Arrange
  const errorTestPage = new ErrorTestPage(page);
  await errorTestPage.goto();

  // Act
  const response = await errorTestPage.triggerUnexpectedError();
  const body = await response.text();

  // Assert
  await expect(errorTestPage.serverResponseStatus).toHaveText(
    "INTERNAL_SERVER_ERROR: Something went wrong. (500)",
  );
  expect(response.request().method()).toBe("GET");
  expect(body).toContain("INTERNAL_SERVER_ERROR");
  expect(body).not.toMatch(/private|stack|cause|details/u);
});

test("shows a default notification for a failed API mutation", async ({ page }) => {
  // Arrange
  const errorTestPage = new ErrorTestPage(page);
  await errorTestPage.goto();

  // Act
  await errorTestPage.triggerDefaultErrorToast();

  // Assert
  await expect(errorTestPage.getToastDialog("Todo item not found.")).toHaveCount(1);
  await expect(errorTestPage.dialogs).not.toContainText("private");
});

test("uses the safe generic message for an unexpected API failure", async ({ page }) => {
  // Arrange
  const errorTestPage = new ErrorTestPage(page);
  await errorTestPage.goto();

  // Act
  await errorTestPage.triggerUnexpectedErrorToast();

  // Assert
  await expect(errorTestPage.getToastDialog("Something went wrong.")).toBeVisible();
  await expect(errorTestPage.dialogs).not.toContainText("private");
});

test("shows the default toast alongside inline API feedback", async ({ page }) => {
  // Arrange
  const errorTestPage = new ErrorTestPage(page);
  await errorTestPage.goto();

  // Act
  await errorTestPage.triggerInlineMutationError();

  // Assert
  await expect(errorTestPage.inlineAlert).toHaveText("Todo item not found.");
  await expect(errorTestPage.getToastDialog("Todo item not found.")).toBeVisible();
  await expect(errorTestPage.dialogs).toHaveCount(1);
});
