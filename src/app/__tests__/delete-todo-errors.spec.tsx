import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { deleteTodoFn } from "@/pages/todos/api/todos.functions";
import { DeleteTodoDialog } from "@/pages/todos/ui/delete-todo-dialog";
import { toast } from "@/shared/ui/shadcn/toast";
import { TEST_TODO } from "@test/vitest/fixtures/todos";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { createQueryClient } from "../query-client";

vi.mock(import("@/pages/todos/api/todos.functions"));
vi.mock(import("@/shared/ui/shadcn/toast"));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("delete todo failure recovery", () => {
  it("keeps confirmation open with inline feedback until a retry succeeds", async () => {
    expect.hasAssertions();
    // Arrange
    const user = await setupFailedDelete();

    // Act
    await user.click(screen.getByRole("button", { name: "Delete Todo" }));
    const error = await screen.findByRole("alert");

    // Assert
    expect(error.textContent).toBe("Something went wrong. Please try again.");
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(toast.add).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole("button", { name: "Delete Todo" }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(deleteTodoFn).toHaveBeenCalledTimes(2);
  });

  it("clears a previous delete error when confirmation is reopened", async () => {
    expect.hasAssertions();
    // Arrange
    const user = await setupFailedDelete();
    await user.click(screen.getByRole("button", { name: "Delete Todo" }));
    const previousError = await screen.findByRole("alert");

    // Assert
    expect(previousError).toBeDefined();

    // Act
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    // Act
    await user.click(screen.getByRole("button", { name: "Delete Item" }));

    // Assert
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

async function setupFailedDelete() {
  const user = userEvent.setup();
  vi.mocked(deleteTodoFn)
    .mockRejectedValueOnce(new Error("private network error"))
    .mockResolvedValueOnce(TEST_TODO);
  const { wrapper } = createTestingWrapper({ queryClient: createQueryClient() });
  render(<DeleteTodoDialog todo={TEST_TODO} />, { wrapper });
  await user.click(screen.getByRole("button", { name: "Delete Item" }));
  return user;
}
