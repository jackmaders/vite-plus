import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { createTodoFixture } from "@test/vitest/fixtures/todos";

import { todoKeys } from "../todo-query-options";
import { updateTodoFn } from "../todos.functions";
import { useUpdateTodo } from "../use-update-todo";

vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));
vi.mock(import("../todos.functions"));

const MOCK_TODO = createTodoFixture();

function createTestContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { queryClient, wrapper: Wrapper };
}

describe("useUpdateTodo mutation hook", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("invokes updateTodoFn and invalidates queries on success", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(updateTodoFn).mockResolvedValueOnce(MOCK_TODO);
    const { queryClient, wrapper } = createTestContext();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateTodo(), { wrapper });

    // Act
    await result.current.mutateAsync({
      data: { title: "Updated Title" },
      id: "todo-1",
    });

    // Assert
    expect(updateTodoFn).toHaveBeenCalledWith({
      data: {
        data: { title: "Updated Title" },
        id: "todo-1",
      },
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: todoKeys.all });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("calls custom onSuccess callback when provided", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(updateTodoFn).mockResolvedValueOnce(MOCK_TODO);
    const onSuccess = vi.fn<() => void>();
    const { wrapper } = createTestContext();
    const { result } = renderHook(() => useUpdateTodo({ onSuccess }), { wrapper });

    // Act
    await result.current.mutateAsync({
      data: { completed: true },
      id: "todo-1",
    });

    // Assert
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
