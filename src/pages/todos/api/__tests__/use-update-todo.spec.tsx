import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";
import { createTodoFixture } from "@test/vitest/fixtures/todos";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { todoKeys } from "../todo-query-options";
import { updateTodoFn } from "../todos.functions";
import { useUpdateTodo } from "../use-update-todo";

vi.mock(import("../todos.functions"));

const MOCK_TODO = createTodoFixture();

describe("useUpdateTodo mutation hook", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("exposes a rejected server call through Query's native error result", async () => {
    expect.hasAssertions();
    // Arrange
    const error = new ApplicationError("TODO_NOT_FOUND", "Todo not found", { status: 404 });
    vi.mocked(updateTodoFn).mockRejectedValueOnce(error);
    const { wrapper } = createTestingWrapper();
    const { result } = renderHook(() => useUpdateTodo(), { wrapper });

    // Act
    result.current.mutate({ data: { title: "Draft" }, id: "missing" });

    // Assert
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeUndefined();
  });

  it("invokes updateTodoFn and invalidates queries on success", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(updateTodoFn).mockResolvedValueOnce(MOCK_TODO);
    const { queryClient, wrapper } = createTestingWrapper();
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
    const { wrapper } = createTestingWrapper();
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
