import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { getRouter } from "@/app/router";
import { ApplicationError } from "@/shared/errors";
import { toast, Toaster } from "@/shared/ui/shadcn/toast";
import { createTodoFixture } from "@test/vitest/fixtures/todos";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import {
  CreateTodoForm,
  createTodoFn,
  deleteTodoFn,
  getTodosFn,
  TodosPage,
  todosQueryOptions,
  UpdateTodoDialog,
  updateTodoFn,
} from "../..";

vi.mock(import("../../api/todos.functions"));

afterEach(() => {
  toast.close();
  cleanup();
  vi.clearAllMocks();
});

describe("todo write recovery", () => {
  it("shows the public application error message when creating a todo fails", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(createTodoFn).mockRejectedValueOnce(new ApplicationError("TODO_CREATE_FAILED"));
    const { user, title } = renderCreateForm();
    await user.type(title, "Draft title");

    // Act
    await user.click(screen.getByRole("button", { name: "Add Todo" }));
    const feedback = await screen.findByRole("alert");

    // Assert
    expect(feedback.textContent).toBe("Todo item could not be created.");
  });

  it("retries a failed create after editing its description while retaining the title", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(createTodoFn)
      .mockRejectedValueOnce(new Error("save failed"))
      .mockResolvedValueOnce(createTodoFixture({ title: "Draft title" }));
    const { user, title } = renderCreateForm();
    await user.type(title, "Draft title");

    // Act
    const failure = await retryFailedSave(user, { buttonName: "Add Todo", title });

    // Assert
    expect(failure).toStrictEqual({
      feedbackVisibleAfterEdit: false,
      message: "save failed",
      retainedTitle: "Draft title",
      retryDisabled: true,
      retryDisabledAfterEdit: false,
    });
    await waitFor(() => {
      expect(title.value).toBe("");
    });
    expect(createTodoFn).toHaveBeenLastCalledWith({
      data: { description: " revised", title: "Draft title" },
    });
  });

  it("retries a failed update after editing its description and closes only after success", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(updateTodoFn)
      .mockRejectedValueOnce(new Error("save failed"))
      .mockResolvedValueOnce(createTodoFixture({ title: "Edited draft" }));
    const { user, title } = await renderUpdateForm();
    await user.clear(title);
    await user.type(title, "Edited draft");

    // Act
    const failure = await retryFailedSave(user, { buttonName: "Update", title });

    // Assert
    expect(failure).toStrictEqual({
      feedbackVisibleAfterEdit: false,
      message: "save failed",
      retainedTitle: "Edited draft",
      retryDisabled: true,
      retryDisabledAfterEdit: false,
    });
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Update Todo Item?" })).toBeNull();
    });
    expect(updateTodoFn).toHaveBeenLastCalledWith({
      data: {
        data: { description: "Test Description revised", title: "Edited draft" },
        id: "todo-1",
      },
    });
  });

  it("keeps a failed delete visible until retry succeeds", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(deleteTodoFn)
      .mockRejectedValueOnce(new ApplicationError("TODO_NOT_FOUND"))
      .mockResolvedValueOnce(createTodoFixture());
    vi.mocked(getTodosFn).mockResolvedValue([]);
    const { user } = renderTodosPage();

    // Act
    const failure = await retryFailedDelete(user);

    // Assert
    expect(failure).toStrictEqual({ message: "Todo item not found.", title: "Test Todo" });
    await expect(screen.findByText("No todos found")).resolves.toBeDefined();
    expect(deleteTodoFn).toHaveBeenCalledTimes(2);
  });

  it("shows a failed toggle notification and retains persisted state until retry succeeds", async () => {
    expect.hasAssertions();

    // Arrange
    const completedTodo = createTodoFixture({ completed: true });
    vi.mocked(updateTodoFn)
      .mockRejectedValueOnce(new ApplicationError("TODO_NOT_FOUND"))
      .mockResolvedValueOnce(completedTodo);
    vi.mocked(getTodosFn).mockResolvedValue([completedTodo]);
    const { user } = renderTodosPage();

    // Act
    const failure = await retryFailedToggle(user);

    // Assert
    expect(failure).toStrictEqual({ checked: "false", message: "Todo item not found." });
    await expect(screen.findByText("Done")).resolves.toBeDefined();
    expect(
      screen.getByRole("checkbox", { name: "Toggle Test Todo" }).getAttribute("aria-checked"),
    ).toBe("true");
  });
});

function renderCreateForm() {
  const user = userEvent.setup();
  const { wrapper } = createTestingWrapper();
  render(<CreateTodoForm />, { wrapper });
  return { title: screen.getByRole<HTMLInputElement>("textbox", { name: "Title" }), user };
}

async function renderUpdateForm() {
  const user = userEvent.setup();
  const { wrapper } = createTestingWrapper();
  render(<UpdateTodoDialog todo={createTodoFixture()} />, { wrapper });
  await user.click(screen.getByRole("button", { name: "Update Item" }));
  return { title: screen.getByRole<HTMLInputElement>("textbox", { name: "Title" }), user };
}

function renderTodosPage() {
  const user = userEvent.setup();
  const { queryClient } = getRouter().options.context;
  queryClient.setQueryDefaults(todosQueryOptions().queryKey, { staleTime: Infinity });
  queryClient.setQueryData(todosQueryOptions().queryKey, [createTodoFixture()]);
  const { wrapper } = createTestingWrapper({ queryClient });
  render(
    <>
      <TodosPage />
      <Toaster />
    </>,
    { wrapper },
  );
  return { user };
}

async function retryFailedDelete(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Delete todo" }));
  await user.click(screen.getByRole("button", { name: "Delete Todo" }));
  const error = await screen.findByRole("alert");
  const failure = { message: error.textContent, title: screen.getByText("Test Todo").textContent };
  await user.click(screen.getByRole("button", { name: "Delete Todo" }));
  return failure;
}

async function retryFailedToggle(user: ReturnType<typeof userEvent.setup>) {
  const toggle = screen.getByRole("checkbox", { name: "Toggle Test Todo" });
  await user.click(toggle);
  const notification = await screen.findByRole("dialog", { name: "Todo item not found." });
  const failure = {
    checked: toggle.getAttribute("aria-checked"),
    message: notification.textContent,
  };
  await user.click(toggle);
  return failure;
}

async function retryFailedSave(
  user: ReturnType<typeof userEvent.setup>,
  { buttonName, title }: { buttonName: string; title: HTMLInputElement },
) {
  await user.click(screen.getByRole("button", { name: buttonName }));
  const error = await screen.findByRole("alert");
  const retry = screen.getByRole<HTMLButtonElement>("button", { name: buttonName });
  const failure = {
    message: error.textContent,
    retainedTitle: title.value,
    retryDisabled: retry.disabled,
  };
  const recovery = await retryAfterDescriptionEdit(user, retry);
  return { ...failure, ...recovery };
}

async function retryAfterDescriptionEdit(
  user: ReturnType<typeof userEvent.setup>,
  retry: HTMLButtonElement,
) {
  await user.type(screen.getByRole("textbox", { name: "Description" }), " revised");
  const recovery = {
    feedbackVisibleAfterEdit: Boolean(screen.queryByRole("alert")),
    retryDisabledAfterEdit: retry.disabled,
  };
  await user.click(retry);
  return recovery;
}
