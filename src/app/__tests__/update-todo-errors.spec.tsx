import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { updateTodoFn } from "@/pages/todos/api/todos.functions";
import { UpdateTodoDialog } from "@/pages/todos/ui/update-todo-dialog";
import { ApplicationError } from "@/shared/errors";
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

describe("update todo failure recovery", () => {
  it("retains edited values and the dialog until a retry succeeds", async () => {
    expect.hasAssertions();
    // Arrange
    const { user, title } = await setupFailedUpdate();

    // Act
    await user.click(screen.getByRole("button", { name: "Update" }));
    const error = await screen.findByRole("alert");

    // Assert
    expect(error.textContent).toBe("Todo item not found. Refresh the list to continue.");
    expect(title.value).toBe("Edited title");
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(toast.add).not.toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole("button", { name: "Update" }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});

async function setupFailedUpdate() {
  const user = userEvent.setup();
  vi.mocked(updateTodoFn)
    .mockRejectedValueOnce(new ApplicationError("TODO_NOT_FOUND"))
    .mockResolvedValueOnce(TEST_TODO);
  const { wrapper } = createTestingWrapper({ queryClient: createQueryClient() });
  render(<UpdateTodoDialog todo={TEST_TODO} />, { wrapper });
  await user.click(screen.getByRole("button", { name: "Update Item" }));
  const title = screen.getByLabelText<HTMLInputElement>("Title");
  await user.clear(title);
  await user.type(title, "Edited title");
  return { title, user };
}
