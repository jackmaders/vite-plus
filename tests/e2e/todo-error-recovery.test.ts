import { expect, test, type Locator, type Page } from "@playwright/test";

const EXISTING_TITLE = "Shared title";

test("retries an unchanged create draft after a real duplicate-title failure", async ({
  page,
  baseURL,
}) => {
  // Arrange
  await signUpAndVisitTodos(page, baseURL);
  const form = await fillCreateDraft(page);

  // Act
  const body = await submitWrite(page, form.getByRole("button", { name: "Add Todo" }));

  // Assert
  expect(body).toContain("TODO_CREATE_FAILED");
  await expect(form.getByRole("alert")).toHaveText("Todo item could not be created.");
  await expect(form.getByRole("textbox", { exact: true, name: "Title" })).toHaveValue(
    EXISTING_TITLE,
  );
  await expect(form.getByRole("button", { name: "Add Todo" })).toBeEnabled();

  // Act: remove the conflict, then retry without editing the failed draft.
  await deleteOriginalTodo(page);
  await form.getByRole("button", { name: "Add Todo" }).click();

  // Assert
  await expect(
    page.getByRole("region", { name: "Your todos" }).getByText("Keep this draft", { exact: true }),
  ).toBeVisible();
});

test("keeps an update draft open after a real constraint failure and allows recovery", async ({
  page,
  baseURL,
}) => {
  // Arrange: another user can create the same title used by the other test.
  await signUpAndVisitTodos(page, baseURL);
  await createTodo(page, "Editable todo");
  const dialog = await fillUpdateDraft(page);

  // Act
  const body = await submitWrite(page, dialog.getByRole("button", { exact: true, name: "Update" }));

  // Assert
  expect(body).toContain("INTERNAL_SERVER_ERROR");
  await expect(dialog.getByRole("alert")).toHaveText("Something went wrong.");
  await expect(dialog.getByRole("textbox", { exact: true, name: "Title" })).toHaveValue(
    EXISTING_TITLE,
  );
  await expect(dialog.getByRole("button", { exact: true, name: "Update" })).toBeEnabled();

  // Act
  await retryUpdate(dialog);

  // Assert
  await expect(
    page.getByRole("region", { name: "Your todos" }).getByText("Keep this draft", { exact: true }),
  ).toBeVisible();
});

async function signUpAndVisitTodos(page: Page, baseURL: string | undefined) {
  const response = await page.request.post("/api/auth/sign-up/email", {
    data: {
      email: `todo-errors-${globalThis.crypto.randomUUID()}@example.com`,
      name: "Todo error test",
      password: "todo-errors-test-password",
    },
    headers: { Origin: String(baseURL) },
  });
  if (!response.ok()) {
    throw new Error(`Test user registration failed (${response.status()})`);
  }
  await page.goto("/todos");
}

async function createTodo(page: Page, title: string) {
  const form = page.getByRole("form", { name: "Create a todo" });
  await form.getByRole("textbox", { exact: true, name: "Title" }).fill(title);
  await form.getByRole("button", { name: "Add Todo" }).click();
  await page
    .getByRole("checkbox", { exact: true, name: `Toggle ${title}` })
    .waitFor({ state: "visible" });
}

async function fillCreateDraft(page: Page) {
  await createTodo(page, EXISTING_TITLE);
  const form = page.getByRole("form", { name: "Create a todo" });
  await form.getByRole("textbox", { exact: true, name: "Title" }).fill(EXISTING_TITLE);
  await form.getByRole("textbox", { name: "Description" }).fill("Keep this draft");
  return form;
}

async function fillUpdateDraft(page: Page) {
  await page.getByRole("button", { name: "Edit todo" }).click();
  await createConflictInAnotherPage(page);
  const dialog = page.getByRole("dialog", { name: "Update Todo Item?" });
  await dialog.getByRole("textbox", { exact: true, name: "Title" }).fill(EXISTING_TITLE);
  await dialog.getByRole("textbox", { name: "Description" }).fill("Keep this draft");
  return dialog;
}

async function createConflictInAnotherPage(page: Page) {
  const otherPage = await page.context().newPage();
  await otherPage.goto("/todos");
  await createTodo(otherPage, EXISTING_TITLE);
  await otherPage.close();
}

async function submitWrite(page: Page, button: Locator) {
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/_serverFn/") && response.request().method() === "POST",
  );
  await button.click();
  const response = await responsePromise;
  return await response.text();
}

async function deleteOriginalTodo(page: Page) {
  await page.getByRole("button", { name: "Delete todo" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete Todo Item?" });
  await dialog.getByRole("button", { exact: true, name: "Delete Todo" }).click();
  await dialog.waitFor({ state: "hidden" });
  await page
    .getByRole("checkbox", { exact: true, name: `Toggle ${EXISTING_TITLE}` })
    .waitFor({ state: "hidden" });
}

async function retryUpdate(dialog: Locator) {
  await dialog.getByRole("textbox", { exact: true, name: "Title" }).fill("Recovered todo");
  await dialog.getByRole("button", { exact: true, name: "Update" }).click();
}
