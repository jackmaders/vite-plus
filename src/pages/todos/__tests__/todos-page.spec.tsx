import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { TodosPage } from "@/pages/todos/ui/todos-page";
import type { Todo } from "@/shared/db";

import {
  createTodoFn,
  deleteTodoFn,
  getTodosFn,
  toggleTodoFn,
  updateTodoFn,
} from "../api/todos.functions";
import type { TodoFilter } from "../ui/todo-filters";

vi.mock(import("../api/todos.functions"));
vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));

const mockTodos: Todo[] = [
  {
    completed: false,
    createdAt: new Date("2026-10-20T00:00:00Z"),
    description: "First description",
    id: "todo-1",
    title: "First Todo",
    updatedAt: new Date("2026-10-20T00:00:00Z"),
    userId: "user-1",
  },
  {
    completed: true,
    createdAt: new Date("2026-10-20T00:00:00Z"),
    description: "Second description",
    id: "todo-2",
    title: "Second Todo",
    updatedAt: new Date("2026-10-20T00:00:00Z"),
    userId: "user-1",
  },
];

function createTestRouter(initialFilter?: TodoFilter) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: Outlet,
  });
  const todosRoute = createRoute({
    component: TodosPage,
    getParentRoute: () => rootRoute,
    path: "/todos",
    validateSearch: (search: Record<string, unknown>) =>
      typeof search["filter"] === "string" ? { filter: search["filter"] as TodoFilter } : {},
  });
  const initialEntry =
    typeof initialFilter === "string" ? `/todos?filter=${initialFilter}` : "/todos";
  const router = createRouter({
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
    routeTree: rootRoute.addChildren([todosRoute]),
  });
  return { queryClient, router };
}

async function renderTodosPage(initialFilter?: TodoFilter) {
  const { queryClient, router } = createTestRouter(initialFilter);
  await router.load();
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

async function editTodoTitle(
  user: ReturnType<typeof userEvent.setup>,
  oldTitle: string,
  newTitle: string,
) {
  const [firstButton] = screen.getAllByRole("button", { name: "Edit todo" });
  if (!firstButton) {
    throw new Error("Expected edit button");
  }
  await user.click(firstButton);
  const input = screen.getByDisplayValue(oldTitle);
  await user.clear(input);
  await user.type(input, newTitle);
  await user.click(screen.getByRole("button", { name: "Save" }));
}

async function clickFirstDelete(user: ReturnType<typeof userEvent.setup>) {
  const [firstButton] = screen.getAllByRole("button", { name: "Delete todo" });
  if (!firstButton) {
    throw new Error("Expected delete button");
  }
  await user.click(firstButton);
}

describe("todos page rendering", () => {
  beforeEach(() => {
    vi.mocked(getTodosFn).mockResolvedValue(mockTodos);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders fetched list of todos with count badges", async () => {
    expect.assertions(4);

    await renderTodosPage();

    await expect(screen.findByText("First Todo")).resolves.toBeDefined();
    expect(screen.getByText("Second Todo")).toBeDefined();
    expect(screen.getByRole("button", { name: /all 2/iu })).toBeDefined();
    expect(screen.getByRole("button", { name: /active 1/iu })).toBeDefined();
  });
});

describe("todos page creation and toggling", () => {
  beforeEach(() => {
    vi.mocked(getTodosFn).mockResolvedValue(mockTodos);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("creates a todo when submitting the form", async () => {
    expect.assertions(2);
    const user = userEvent.setup();
    vi.mocked(createTodoFn).mockResolvedValue(mockTodos[0] as never);

    await renderTodosPage();
    await expect(screen.findByText("First Todo")).resolves.toBeDefined();

    await user.type(screen.getByPlaceholderText("Title"), "Brand New Todo");
    await user.click(screen.getByRole("button", { name: "Add Todo" }));

    expect(createTodoFn).toHaveBeenCalledWith({
      data: { title: "Brand New Todo" },
    });
  });

  it("toggles a todo status", async () => {
    expect.assertions(2);
    const user = userEvent.setup();
    vi.mocked(toggleTodoFn).mockResolvedValue({ ...mockTodos[0], completed: true } as never);

    await renderTodosPage();
    await expect(screen.findByText("First Todo")).resolves.toBeDefined();

    await user.click(screen.getByRole("checkbox", { name: /toggle first todo/iu }));

    expect(toggleTodoFn).toHaveBeenCalledWith({
      data: { completed: true, id: "todo-1" },
    });
  });
});

describe("todos page updates and deletion", () => {
  beforeEach(() => {
    vi.mocked(getTodosFn).mockResolvedValue(mockTodos);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("edits a todo title and saves", async () => {
    expect.assertions(2);
    const user = userEvent.setup();
    vi.mocked(updateTodoFn).mockResolvedValue({ ...mockTodos[0], title: "Updated" } as never);

    await renderTodosPage();
    await expect(screen.findByText("First Todo")).resolves.toBeDefined();
    await editTodoTitle(user, "First Todo", "Updated Todo");

    expect(updateTodoFn).toHaveBeenCalledWith({
      data: { description: "First description", id: "todo-1", title: "Updated Todo" },
    });
  });

  it("deletes a todo when clicking delete", async () => {
    expect.assertions(2);
    const user = userEvent.setup();
    vi.mocked(deleteTodoFn).mockResolvedValue({ id: "todo-1" } as never);

    await renderTodosPage();
    await expect(screen.findByText("First Todo")).resolves.toBeDefined();
    await clickFirstDelete(user);

    expect(deleteTodoFn).toHaveBeenCalledWith({
      data: { id: "todo-1" },
    });
  });
});

describe("todos page filtering", () => {
  beforeEach(() => {
    vi.mocked(getTodosFn).mockResolvedValue(mockTodos);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders with initial filter query parameter", async () => {
    expect.assertions(3);

    await renderTodosPage("completed");
    await expect(screen.findByText("Second Todo")).resolves.toBeDefined();
    expect(screen.queryByText("First Todo")).toBeNull();
    expect(screen.getByRole("button", { name: /completed 1/iu })).toBeDefined();
  });

  it("filters todos by active and completed status", async () => {
    expect.assertions(5);
    const user = userEvent.setup();

    await renderTodosPage();
    await expect(screen.findByText("First Todo")).resolves.toBeDefined();

    await user.click(screen.getByRole("button", { name: /active 1/iu }));
    expect(screen.getByText("First Todo")).toBeDefined();
    expect(screen.queryByText("Second Todo")).toBeNull();

    await user.click(screen.getByRole("button", { name: /completed 1/iu }));
    expect(screen.getByText("Second Todo")).toBeDefined();
    expect(screen.queryByText("First Todo")).toBeNull();
  });
});
