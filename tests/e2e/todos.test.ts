import { expect, test, type Page } from "@playwright/test";

const RADIX_BASE = 36;
const SLICE_START = 2;
const DEFAULT_ORIGIN = "http://localhost:5173";

async function registerAndLogin(page: Page, origin: string = DEFAULT_ORIGIN): Promise<void> {
  const uniqueId = `${Date.now()}-${Math.random().toString(RADIX_BASE).slice(SLICE_START)}`;
  await page.request.post("/api/auth/sign-up/email", {
    data: {
      email: `user-${uniqueId}@example.com`,
      name: "Test User",
      password: "TestPassword123!",
    },
    headers: { origin },
  });
}

async function createTodoItem(page: Page, title: string, description: string): Promise<void> {
  await expect(page.getByRole("button", { name: "Open TanStack Devtools" })).toBeVisible();
  await page.getByPlaceholder("Title").fill(title);
  await page.getByPlaceholder("Description").fill(description);
  await page.getByRole("button", { name: "Add Todo" }).click();
}

async function createAndCompleteTodo(page: Page, title: string, note: string): Promise<void> {
  await createTodoItem(page, title, note);
  await page.getByRole("checkbox", { name: `Toggle ${title}` }).click();
}

async function submitEdit(page: Page, title: string, note: string): Promise<void> {
  const editRegion = page.getByRole("region", { name: "Edit todo" });
  await editRegion.getByPlaceholder("Title").fill(title);
  await editRegion.getByPlaceholder("Description").fill(note);
  await editRegion.getByRole("button", { name: "Save" }).click();
}

test.describe("todos access and navigation", () => {
  test("redirects unauthenticated users to home page", async ({ page }) => {
    // Act
    await page.goto("/todos");

    // Assert
    await expect(page).toHaveURL("/");
  });

  test("navigates to todos page from home header", async ({ baseURL, page }) => {
    // Arrange
    await registerAndLogin(page, baseURL);
    await page.goto("/");

    // Act
    await page.getByRole("navigation").getByRole("link", { name: "Todos" }).click();

    // Assert
    await expect(page).toHaveURL(/\/todos/u);
    await expect(page.getByRole("heading", { level: 1, name: "Todos" })).toBeVisible();
  });
});

test.describe("todos create and edit", () => {
  test("creates a new todo item", async ({ baseURL, page }) => {
    // Arrange
    await registerAndLogin(page, baseURL);
    await page.goto("/todos");

    // Act
    await createTodoItem(page, "Buy groceries", "Milk, eggs, and bread");

    // Assert
    await expect(page.getByText("Buy groceries")).toBeVisible();
    await expect(page.getByText("Milk, eggs, and bread")).toBeVisible();
    await expect(page.getByText("Pending")).toBeVisible();
  });

  test("edits an existing todo item", async ({ baseURL, page }) => {
    // Arrange
    await registerAndLogin(page, baseURL);
    await page.goto("/todos");
    await createTodoItem(page, "Original task", "Original note");
    await expect(page.getByText("Original task")).toBeVisible();

    // Act
    await page.getByRole("button", { name: "Edit todo" }).click();
    await submitEdit(page, "Updated task", "Updated note");

    // Assert
    await expect(page.getByText("Updated task")).toBeVisible();
    await expect(page.getByText("Updated note")).toBeVisible();
  });
});

test.describe("todos status and filtering", () => {
  test("toggles completion status of a todo item", async ({ baseURL, page }) => {
    // Arrange
    await registerAndLogin(page, baseURL);
    await page.goto("/todos");
    await createTodoItem(page, "Toggle task", "Toggle note");

    // Act
    await page.getByRole("checkbox", { name: "Toggle Toggle task" }).click();

    // Assert
    await expect(page.getByText("Done")).toBeVisible();
    await expect(page.getByText("Toggle task")).toHaveClass(/line-through/u);
  });

  test("filters todos by active status", async ({ baseURL, page }) => {
    // Arrange
    await registerAndLogin(page, baseURL);
    await page.goto("/todos");
    await createTodoItem(page, "Active item", "Active note");
    await createAndCompleteTodo(page, "Completed item", "Completed note");

    // Act
    await page.getByRole("button", { name: /^active/iu }).click();

    // Assert
    await expect(page.getByText("Active item")).toBeVisible();
    await expect(page.getByText("Completed item")).toBeHidden();
  });

  test("filters todos by completed status", async ({ baseURL, page }) => {
    // Arrange
    await registerAndLogin(page, baseURL);
    await page.goto("/todos");
    await createTodoItem(page, "Active item", "Active note");
    await createAndCompleteTodo(page, "Completed item", "Completed note");

    // Act
    await page.getByRole("button", { name: /^completed/iu }).click();

    // Assert
    await expect(page.getByText("Completed item")).toBeVisible();
    await expect(page.getByText("Active item")).toBeHidden();
  });
});

test.describe("todos deletion", () => {
  test("deletes a todo item and displays empty state", async ({ baseURL, page }) => {
    // Arrange
    await registerAndLogin(page, baseURL);
    await page.goto("/todos");
    await createTodoItem(page, "Delete task", "Delete note");
    await expect(page.getByText("Delete task")).toBeVisible();

    // Act
    await page.getByRole("button", { name: "Delete todo" }).click();

    // Assert
    await expect(page.getByText("No todos found")).toBeVisible();
    await expect(page.getByText("Delete task")).toBeHidden();
  });
});
