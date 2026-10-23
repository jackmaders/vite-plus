import { expect, test, type Page, type Response } from "@playwright/test";
import { createControlledPromise } from "@tanstack/react-router";

test.describe("before hydration", () => {
  test("keeps form controls disabled until client handlers are ready", async ({
    page,
    baseURL,
  }) => {
    // Arrange
    const hydration = createControlledPromise<boolean>();
    await page.route("**/assets/index-*.js", async (route) => {
      await hydration;
      await route.continue();
    });
    await signUpForTodos(page, String(baseURL));

    // Act
    await page.goto("/todos", { waitUntil: "commit" });

    // Assert
    try {
      await expect(page.getByRole("textbox", { exact: true, name: "Title" })).toBeDisabled();
      await expect(page.getByRole("button", { name: "Add Todo" })).toBeDisabled();
    } finally {
      hydration.resolve(true);
    }
    await expect(page.getByRole("textbox", { exact: true, name: "Title" })).toBeEnabled();
  });
});

test("keeps an edit draft when another tab deletes its todo", async ({ page, baseURL }) => {
  // Arrange
  const editingPage = await prepareDeletedTodoDraft(page, String(baseURL));

  // Act
  const failureResponse = editingPage.waitForResponse(isMutationResponse);
  await editingPage
    .getByRole("dialog")
    .getByRole("button", { exact: true, name: "Update" })
    .click();
  const response = await failureResponse;
  const body = await response.text();
  await retryStaleDraft(editingPage);

  // Assert
  await expect(editingPage.getByRole("alert")).toContainText(/Todo not found.*Reference:/u);
  await expect(
    editingPage.getByRole("dialog").getByRole("textbox", { exact: true, name: "Title" }),
  ).toHaveValue("Unsaved draft");
  expect(body).toContain("TODO_NOT_FOUND");
  expect(body).toContain("ApplicationError");
});

test("handles a denied browser clipboard operation inline", async ({ page, baseURL }) => {
  // Arrange
  await page.addInitScript(() => {
    Object.defineProperty(globalThis.navigator, "clipboard", {
      value: {
        writeText: async () => {
          await Promise.reject(new Error("Permission denied"));
        },
      },
    });
  });
  await createTodoForNewUser(page, String(baseURL), "Copy this title");

  // Act
  await page.getByRole("button", { exact: true, name: "Copy Copy this title" }).click();

  // Assert
  await expect(page.getByRole("alert")).toHaveText(
    "Unable to copy. Please copy the title manually.",
  );
});

test("classifies invalid RPC input before writing a todo", async ({ page, baseURL }) => {
  // Arrange
  const creation = await createTodoForNewUser(page, String(baseURL), "Valid RPC title");

  // Act
  const response = await page.request.post(creation.url(), {
    data: String(creation.request().postData()).replace("Valid RPC title", "   "),
    headers: {
      "Content-Type": "application/json",
      Origin: String(baseURL),
      "x-tsr-serverfn": "true",
    },
  });
  const body = await response.text();

  // Assert
  expect(body).toContain("INVALID_INPUT");
  expect(body).toContain("ApplicationError");
  expect(body).not.toContain("too_small");
});

async function prepareDeletedTodoDraft(page: Page, origin: string) {
  const title = `Error flow ${globalThis.crypto.randomUUID()}`;
  await createTodoForNewUser(page, origin, title);
  const editingPage = await page.context().newPage();
  await editingPage.goto("/todos");
  await editingPage.getByRole("button", { name: "Edit todo" }).click();
  await editingPage
    .getByRole("dialog")
    .getByRole("textbox", { exact: true, name: "Title" })
    .fill("Unsaved draft");
  await page.getByRole("button", { exact: true, name: "Delete todo" }).click();
  await page.getByRole("dialog").getByRole("button", { exact: true, name: "Delete Todo" }).click();
  await expect(page.getByText(title, { exact: true })).toHaveCount(0);
  return editingPage;
}

async function createTodoForNewUser(page: Page, origin: string, title: string) {
  await signUpForTodos(page, origin);
  await page.goto("/todos");
  await page.getByRole("textbox", { exact: true, name: "Title" }).fill(title);
  const creation = page.waitForResponse(isMutationResponse);
  await page.getByRole("button", { name: "Add Todo" }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  return await creation;
}

async function signUpForTodos(page: Page, origin: string) {
  const signup = await page.request.post("/api/auth/sign-up/email", {
    data: {
      email: `${globalThis.crypto.randomUUID()}@example.com`,
      name: "Error handling test",
      password: "template-test-password-123",
    },
    headers: { Origin: origin },
  });
  expect(signup.ok()).toBe(true);
}

function isMutationResponse(response: Response) {
  return response.request().method() === "POST" && response.url().includes("/_serverFn/");
}

async function retryStaleDraft(page: Page) {
  const responsePromise = page.waitForResponse(isMutationResponse);
  await page.getByRole("button", { name: "Try again" }).click();
  const response = await responsePromise;
  const body = await response.text();
  expect(body).toContain("TODO_NOT_FOUND");
}
