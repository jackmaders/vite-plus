import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { createTodoFixture } from "@test/vitest/fixtures/todos";
import { createReactQueryWrapper } from "@test/vitest/wrappers/react-query-wrapper";
import { createTanStackRouterWrapper } from "@test/vitest/wrappers/tanstack-router-wrapper";

import { todoKeys } from "../todo-query-options";
import { deleteTodoFn } from "../todos.functions";
import { useDeleteTodo } from "../use-delete-todo";

vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));
vi.mock(import("../todos.functions"));

const MOCK_TODO = createTodoFixture();

function createTestContext() {
  const { queryClient, wrapper: QueryWrapper } = createReactQueryWrapper();
  const { wrapper: RouterWrapper } = createTanStackRouterWrapper();

  // oxlint-disable-next-line unicorn/consistent-function-scoping -- JSX captures the per-test provider wrappers.
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <RouterWrapper>
        <QueryWrapper>{children}</QueryWrapper>
      </RouterWrapper>
    );
  }

  return { queryClient, wrapper: Wrapper };
}

describe("useDeleteTodo mutation hook", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("invokes deleteTodoFn and invalidates queries on success", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(deleteTodoFn).mockResolvedValueOnce(MOCK_TODO);
    const { queryClient, wrapper } = createTestContext();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteTodo(), { wrapper });

    // Act
    await result.current.mutateAsync({ id: "todo-1" });

    // Assert
    expect(deleteTodoFn).toHaveBeenCalledWith({ data: { id: "todo-1" } });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: todoKeys.all });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("calls custom onSuccess callback when provided", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(deleteTodoFn).mockResolvedValueOnce(MOCK_TODO);
    const onSuccess = vi.fn<() => void>();
    const { wrapper } = createTestContext();
    const { result } = renderHook(() => useDeleteTodo({ onSuccess }), { wrapper });

    // Act
    await result.current.mutateAsync({ id: "todo-1" });

    // Assert
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
