import { expect, test, type Page } from "@playwright/test";

test("restores a known application error after a production server-function request", async ({
  page,
}) => {
  // Arrange
  await page.goto("/");
  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("/_serverFn/"),
  );

  // Act
  await page.getByRole("button", { exact: true, name: "known" }).click();
  const response = await responsePromise;
  const body = await response.text();

  // Assert
  await expect
    .poll(async () => await readResult(page))
    .toStrictEqual({
      applicationError: true,
      code: "TODO_NOT_FOUND",
      message: "Todo item not found.",
      notFound: false,
      redirect: false,
      statusCode: 404,
    });
  expect(body).not.toContain("private");
  expect(body).not.toContain("stack");
  expect(body).not.toContain("cause");
  expect(body).not.toContain("details");
});

test("rejects unknown failures with a safe fallback", async ({ page }) => {
  // Arrange
  await page.goto("/");
  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("/_serverFn/"),
  );

  // Act
  await page.getByRole("button", { exact: true, name: "unknown" }).click();
  const response = await responsePromise;
  const body = await response.text();

  // Assert
  await expect
    .poll(async () => await readResult(page))
    .toStrictEqual({
      applicationError: true,
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong.",
      notFound: false,
      redirect: false,
      statusCode: 500,
    });
  expect(body).not.toContain("private");
  expect(body).not.toContain("stack");
  expect(body).not.toContain("cause");
});

test("preserves redirect signals", async ({ page }) => {
  // Arrange
  await page.goto("/");

  // Act
  await page.getByRole("button", { exact: true, name: "redirect" }).click();

  // Assert
  await expect
    .poll(async () => await readResult(page))
    .toStrictEqual({ applicationError: false, notFound: false, redirect: true });
});

test("preserves not-found signals", async ({ page }) => {
  // Arrange
  await page.goto("/");

  // Act
  await page.getByRole("button", { exact: true, name: "notFound" }).click();

  // Assert
  await expect
    .poll(async () => await readResult(page))
    .toStrictEqual({ applicationError: false, notFound: true, redirect: false });
});

async function readResult(page: Page) {
  const text = (await page.getByRole("status").textContent()) ?? "";
  return JSON.parse(text.length === 0 ? "{}" : text) as unknown;
}
