import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { getRouter } from "@/app/router";
import { ApplicationError } from "@/shared/errors";
import { toast } from "@/shared/ui/shadcn/toast";
import { retryFailedSave } from "@test/vitest/fixtures/form-submissions";
import { TEST_TODO } from "@test/vitest/fixtures/todos";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { UpdateTodoDialog, updateTodoFn } from "../..";

vi.mock(import("../../api/todos.functions"));
vi.mock(import("@/shared/ui/shadcn/toast"));

beforeEach(() => {
  vi.mocked(updateTodoFn).mockReset().mockResolvedValue(TEST_TODO);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("update todo dialog", () => {
  it("opens the dialog with the existing todo values", async () => {
    expect.assertions(3);

    // Arrange
    const { user } = renderUpdateDialog();

    // Act
    await user.click(screen.getByRole("button", { name: "Update Item" }));

    // Assert
    expect(screen.getByRole("heading", { name: "Update Todo Item?" })).toBeDefined();
    expect(screen.getByRole<HTMLInputElement>("textbox", { name: "Title" }).value).toBe(
      "Test Todo",
    );
    expect(screen.getByRole<HTMLInputElement>("textbox", { name: "Description" }).value).toBe(
      "Test Description",
    );
  });

  it("submits modified values and closes only after success", async () => {
    expect.hasAssertions();

    // Arrange
    const { user } = renderUpdateDialog();
    await openAndEditTitle(user, "Updated Title");

    // Act
    await user.click(screen.getByRole("button", { name: "Update" }));

    // Assert
    expect(updateTodoFn).toHaveBeenCalledWith({
      data: { data: { description: "Test Description", title: "Updated Title" }, id: TEST_TODO.id },
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("preserves a failed draft and retries after editing only its description", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(updateTodoFn).mockRejectedValueOnce(new ApplicationError("TODO_NOT_FOUND"));
    const { user } = renderUpdateDialog();
    const title = await openAndEditTitle(user, "Edited draft");

    // Act
    const failure = await retryFailedSave(user, { buttonName: "Update", title });

    // Assert
    expect(failure).toStrictEqual({
      feedbackVisibleAfterEdit: false,
      message: "Todo item not found.",
      retainedTitle: "Edited draft",
      retryDisabled: true,
      retryDisabledAfterEdit: false,
    });
    expect(toast.add).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(updateTodoFn).toHaveBeenLastCalledWith({
      data: {
        data: { description: "Test Description revised", title: "Edited draft" },
        id: TEST_TODO.id,
      },
    });
  });

  it("retains the invalid title and feedback without submitting", async () => {
    expect.assertions(4);

    // Arrange
    const { user } = renderUpdateDialog();
    const title = await openAndEditTitle(user, "   ");

    // Act
    await user.click(screen.getByRole("button", { name: "Update" }));
    const feedback = await screen.findByText("Title is required");

    // Assert
    expect(feedback).toBeDefined();
    expect(title.value).toBe("   ");
    expect(updateTodoFn).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("uses an empty description when the persisted description is null", async () => {
    expect.assertions(1);

    // Arrange
    const { user } = renderUpdateDialog({ ...TEST_TODO, description: null });

    // Act
    await user.click(screen.getByRole("button", { name: "Update Item" }));

    // Assert
    expect(screen.getByRole<HTMLInputElement>("textbox", { name: "Description" }).value).toBe("");
  });

  it("closes the dialog when cancelled", async () => {
    expect.hasAssertions();

    // Arrange
    const { user } = renderUpdateDialog();
    await user.click(screen.getByRole("button", { name: "Update Item" }));

    // Act
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});

function renderUpdateDialog(todo = TEST_TODO) {
  const { wrapper } = createTestingWrapper({
    queryClient: getRouter().options.context.queryClient,
  });
  render(<UpdateTodoDialog todo={todo} />, { wrapper });
  return { user: userEvent.setup() };
}

async function openAndEditTitle(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.click(screen.getByRole("button", { name: "Update Item" }));
  const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Title" });
  await user.clear(input);
  await user.type(input, title);
  return input;
}
