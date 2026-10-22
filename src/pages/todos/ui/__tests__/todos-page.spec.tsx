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

import {
  getTodosFn,
  TodosPage,
  useCreateTodo,
  useDeleteTodo,
  useUpdateTodo,
  type TodoCompletionStatus,
} from "@/pages/todos";
import { TEST_TODOS } from "@test/vitest/fixtures/todos";

vi.mock(import("@/pages/todos/api/todos.functions"));
vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));
vi.mock(import("@/pages/todos/api/use-create-todo"));
vi.mock(import("@/pages/todos/api/use-update-todo"));
vi.mock(import("@/pages/todos/api/use-delete-todo"));

const mockTodos = TEST_TODOS;

function createTestRouter(initialStatus?: TodoCompletionStatus) {
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
      typeof search["status"] === "string"
        ? { status: search["status"] as TodoCompletionStatus }
        : {},
  });
  const initialEntry =
    typeof initialStatus === "string" ? `/todos?status=${initialStatus}` : "/todos";
  const router = createRouter({
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
    routeTree: rootRoute.addChildren([todosRoute]),
  });
  return { queryClient, router };
}

async function renderTodosPage(initialStatus?: TodoCompletionStatus) {
  const { queryClient, router } = createTestRouter(initialStatus);
  await router.load();
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("todos page rendering", () => {
  beforeEach(() => {
    vi.mocked(getTodosFn).mockResolvedValue(mockTodos);
    vi.mocked(useCreateTodo).mockReturnValue({
      isPending: false,
      mutate: vi.fn<() => void>(),
      mutateAsync: vi.fn<() => Promise<unknown>>(),
    } as never);
    vi.mocked(useUpdateTodo).mockReturnValue({
      isPending: false,
      mutate: vi.fn<() => void>(),
      mutateAsync: vi.fn<() => Promise<unknown>>(),
    } as never);
    vi.mocked(useDeleteTodo).mockReturnValue({
      isPending: false,
      mutate: vi.fn<() => void>(),
    } as never);
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

describe("todos page filtering", () => {
  beforeEach(() => {
    vi.mocked(getTodosFn).mockResolvedValue(mockTodos);
    vi.mocked(useCreateTodo).mockReturnValue({
      isPending: false,
      mutate: vi.fn<() => void>(),
      mutateAsync: vi.fn<() => Promise<unknown>>(),
    } as never);
    vi.mocked(useUpdateTodo).mockReturnValue({
      isPending: false,
      mutate: vi.fn<() => void>(),
      mutateAsync: vi.fn<() => Promise<unknown>>(),
    } as never);
    vi.mocked(useDeleteTodo).mockReturnValue({
      isPending: false,
      mutate: vi.fn<() => void>(),
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders with initial status query parameter", async () => {
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
