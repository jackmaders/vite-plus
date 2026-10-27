import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { getRouter } from "@/app/router";
import { todosQueryOptions } from "@/pages/todos";
import { createTodoFn, getTodosFn } from "@/pages/todos/api/todos.functions";
import { getSessionFn, useSession } from "@/shared/auth";
import { TEST_SESSION } from "@test/vitest/fixtures/session";
import { createTodoFixture, TEST_TODOS } from "@test/vitest/fixtures/todos";

vi.mock(import("@/shared/auth"));
vi.mock(import("@/pages/todos/api/todos.functions"));
vi.mock(import("@/app/styles/index.css?url"), () => ({ default: "/index.css" }));
vi.mock(import("@tanstack/react-devtools"));

function createTodosRouter() {
  const router = getRouter();
  router.update({
    context: router.options.context,
    history: createMemoryHistory({ initialEntries: ["/todos"] }),
  });
  return router;
}

async function renderTodosRoute() {
  const router = createTodosRouter();
  await router.load();
  render(<RouterProvider router={router} />, { container: document });
}

async function createTodoThroughForm(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.type(await screen.findByRole("textbox", { name: "Title" }), title);
  await user.click(screen.getByRole("button", { name: "Add Todo" }));
}

describe("authenticated todos route", () => {
  beforeEach(() => {
    vi.mocked(getSessionFn).mockResolvedValue(TEST_SESSION);
    vi.mocked(useSession).mockReturnValue({ data: TEST_SESSION, isPending: false } as never);
    vi.mocked(getTodosFn).mockResolvedValue(TEST_TODOS);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads todos into the router query cache before rendering the page", async () => {
    expect.assertions(3);

    // Arrange
    const router = createTodosRouter();

    // Act
    await router.load();
    const cachedTodos = router.options.context.queryClient.getQueryData(
      todosQueryOptions().queryKey,
    );
    render(<RouterProvider router={router} />, { container: document });
    const firstTodo = await screen.findByText("First Todo");

    // Assert
    expect(cachedTodos).toStrictEqual(TEST_TODOS);
    expect(firstTodo).toBeDefined();
    expect(screen.getByRole("button", { name: "Add Todo" })).toBeDefined();
  });

  it("redirects signed-out visitors before reading private todos", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValue(null);
    const router = createTodosRouter();

    // Act
    await router.load();

    // Assert
    expect(router.state.location.pathname).toBe("/");
    expect(getTodosFn).not.toHaveBeenCalled();
  });

  it("marks personalized server-rendered content as private and non-cacheable", async () => {
    expect.assertions(1);

    // Arrange
    const router = createTodosRouter();
    router.update({ context: router.options.context, isServer: true });

    // Act
    await router.load();
    const match = router.state.matches.find((item) => item.routeId === "/_authenticated/todos");

    // Assert
    expect(match?.headers).toMatchObject({ "Cache-Control": "private, no-store" });
  });

  it("renders the empty state when the user has no todos", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(getTodosFn).mockResolvedValue([]);
    const router = createTodosRouter();

    // Act
    await router.load();
    render(<RouterProvider router={router} />, { container: document });
    const emptyState = await screen.findByText("No todos found");

    // Assert
    expect(emptyState).toBeDefined();
  });

  it("refreshes the displayed todos after a successful create", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    const createdTodo = createTodoFixture({ id: "new-todo", title: "New Todo" });
    vi.mocked(getTodosFn).mockResolvedValue([]);
    vi.mocked(createTodoFn).mockImplementation(async () => {
      vi.mocked(getTodosFn).mockResolvedValue([createdTodo]);
      return await Promise.resolve(createdTodo);
    });
    await renderTodosRoute();

    // Act
    await createTodoThroughForm(user, "New Todo");
    const newTodo = await screen.findByText("New Todo");

    // Assert
    expect(createTodoFn).toHaveBeenCalledWith({ data: { description: "", title: "New Todo" } });
    expect(newTodo).toBeDefined();
  });
});
