import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { getRouter } from "@/app/router";
import { toast } from "@/shared/ui/shadcn/toast";
import { TEST_TODO } from "@test/vitest/fixtures/todos";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { deleteTodoFn } from "../../api/todos.functions";
import { DeleteTodoDialog } from "../delete-todo-dialog";

vi.mock(import("../../api/todos.functions"));
vi.mock(import("@/shared/ui/shadcn/toast"));

beforeEach(() => {
  vi.mocked(deleteTodoFn).mockReset().mockResolvedValue(TEST_TODO);
});

describe("delete todo dialog", () => {
  it("opens confirmation from its trigger", async () => {
    expect.assertions(1);

    // Arrange
    const { user } = renderDeleteDialog();

    // Act
    await user.click(screen.getByRole("button", { name: "Delete Item" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Delete Todo Item?" })).toBeDefined();
  });

  it("deletes the selected todo and closes confirmation after success", async () => {
    expect.hasAssertions();

    // Arrange
    const { user } = renderDeleteDialog();
    await user.click(screen.getByRole("button", { name: "Delete Item" }));

    // Act
    await user.click(screen.getByRole("button", { name: "Delete Todo" }));

    // Assert
    expect(deleteTodoFn).toHaveBeenCalledWith({ data: { id: TEST_TODO.id } });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("disables confirmation while deletion is pending", async () => {
    expect.hasAssertions();

    // Act
    const pendingDisabled = await completePendingDelete();

    // Assert
    expect(pendingDisabled).toBe(true);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("keeps confirmation open with feedback until a retry succeeds", async () => {
    expect.hasAssertions();

    // Arrange
    const { user } = await setupFailedDelete();

    // Act
    const failure = await retryFailedDelete(user);

    // Assert
    expect(failure).toStrictEqual({ dialogOpen: true, message: "Network unavailable" });
    expect(toast.add).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(deleteTodoFn).toHaveBeenCalledTimes(2);
  });

  it("clears previous feedback when confirmation is reopened", async () => {
    expect.assertions(2);

    // Arrange
    const { user } = await setupFailedDelete();
    await user.click(screen.getByRole("button", { name: "Delete Todo" }));
    const previousError = await screen.findByRole("alert");
    const previousMessage = previousError.textContent;

    // Act
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Delete Item" }));

    // Assert
    expect(previousMessage).toBe("Network unavailable");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

function renderDeleteDialog() {
  const { wrapper } = createTestingWrapper({
    queryClient: getRouter().options.context.queryClient,
  });
  render(<DeleteTodoDialog todo={TEST_TODO} />, { wrapper });
  return { user: userEvent.setup() };
}

async function setupFailedDelete() {
  vi.mocked(deleteTodoFn).mockRejectedValueOnce(new Error("Network unavailable"));
  const { user } = renderDeleteDialog();
  await user.click(screen.getByRole("button", { name: "Delete Item" }));
  return { user };
}

async function retryFailedDelete(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Delete Todo" }));
  const feedback = await screen.findByRole("alert");
  const failure = {
    dialogOpen: Boolean(screen.queryByRole("dialog")),
    message: feedback.textContent,
  };
  await user.click(screen.getByRole("button", { name: "Delete Todo" }));
  return failure;
}

async function completePendingDelete() {
  const deletion: { complete?: () => void } = {};
  const pending = new Promise<typeof TEST_TODO>((resolve) => {
    deletion.complete = () => {
      resolve(TEST_TODO);
    };
  });
  vi.mocked(deleteTodoFn).mockReturnValueOnce(pending);
  const { user } = renderDeleteDialog();
  await user.click(screen.getByRole("button", { name: "Delete Item" }));
  await user.click(screen.getByRole("button", { name: "Delete Todo" }));
  const { disabled } = screen.getByRole<HTMLButtonElement>("button", { name: "Deleting..." });
  await act(async () => {
    deletion.complete?.();
    await pending;
  });
  return disabled;
}
