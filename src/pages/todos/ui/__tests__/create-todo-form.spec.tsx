import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { getRouter } from "@/app/router";
import { ApplicationError, applicationErrorAdapter } from "@/shared/errors";
import { toast } from "@/shared/ui/shadcn/toast";
import { retryFailedSave } from "@test/vitest/fixtures/form-submissions";
import { TEST_TODO } from "@test/vitest/fixtures/todos";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { CreateTodoForm, createTodoFn } from "../..";

vi.mock(import("../../api/todos.functions"));
vi.mock(import("@/shared/ui/shadcn/toast"));

beforeEach(() => {
  vi.mocked(createTodoFn).mockReset().mockResolvedValue(TEST_TODO);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("create todo form", () => {
  it("submits title and description and resets the inputs after success", async () => {
    expect.hasAssertions();

    // Arrange
    const { user } = renderCreateForm();

    // Act
    await fillAndSubmit(user, "New Todo", "New Description");

    // Assert
    expect(createTodoFn).toHaveBeenCalledWith({
      data: { description: "New Description", title: "New Todo" },
    });
    await waitFor(() => {
      expect({
        description: screen.getByRole<HTMLInputElement>("textbox", { name: "Description" }).value,
        title: screen.getByRole<HTMLInputElement>("textbox", { name: "Title" }).value,
      }).toStrictEqual({ description: "", title: "" });
    });
  });

  it("submits a title with an empty description", async () => {
    expect.hasAssertions();

    // Arrange
    const { user, title } = renderCreateForm();

    // Act
    await fillAndSubmit(user, "Title Only");

    // Assert
    expect(createTodoFn).toHaveBeenCalledWith({ data: { description: "", title: "Title Only" } });
    await waitFor(() => {
      expect(title.value).toBe("");
    });
  });

  it("shows the public server error with a preserved draft and default toast", async () => {
    expect.hasAssertions();

    // Arrange
    const failure = applicationErrorAdapter.fromSerializable(
      applicationErrorAdapter.toSerializable(
        new ApplicationError("TODO_CREATE_FAILED", { message: "private override" }),
      ),
    );
    vi.mocked(createTodoFn).mockRejectedValueOnce(failure);
    const { user, title } = renderCreateForm();

    // Act
    await fillAndSubmit(user, "Draft title", "Draft description");
    const feedback = await screen.findByRole("alert");

    // Assert
    expect(feedback.textContent).toBe("Todo item could not be created.");
    expect({
      description: screen.getByRole<HTMLInputElement>("textbox", { name: "Description" }).value,
      title: title.value,
    }).toStrictEqual({ description: "Draft description", title: "Draft title" });
    expect(toast.add).toHaveBeenCalledOnce();
  });

  it("retries after editing the description while retaining the failed draft title", async () => {
    expect.hasAssertions();

    // Arrange
    vi.mocked(createTodoFn).mockRejectedValueOnce(new Error("save failed"));
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

  it("preserves invalid input and validation feedback without calling the server", async () => {
    expect.assertions(3);

    // Arrange
    const { user, title } = renderCreateForm();
    await user.type(title, "   ");

    // Act
    fireEvent.submit(screen.getByRole("form", { name: "Create todo" }));
    const feedback = await screen.findByText("Title is required");

    // Assert
    expect(feedback).toBeDefined();
    expect(title.value).toBe("   ");
    expect(createTodoFn).not.toHaveBeenCalled();
  });

  it("disables submit when the title becomes empty or whitespace", async () => {
    expect.assertions(2);

    // Arrange
    const { user, title } = renderCreateForm();
    const submit = screen.getByRole<HTMLButtonElement>("button", { name: "Add Todo" });

    // Act
    await user.type(title, "Draft title");
    await user.clear(title);
    const emptyDisabled = submit.disabled;
    await user.type(title, "   ");

    // Assert
    expect(emptyDisabled).toBe(true);
    expect(submit.disabled).toBe(true);
  });
});

function renderCreateForm() {
  const { wrapper } = createTestingWrapper({
    queryClient: getRouter().options.context.queryClient,
  });
  render(<CreateTodoForm aria-label="Create todo" />, { wrapper });
  return {
    title: screen.getByRole<HTMLInputElement>("textbox", { name: "Title" }),
    user: userEvent.setup(),
  };
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
  description?: string,
) {
  await user.type(screen.getByRole("textbox", { name: "Title" }), title);
  if (typeof description === "string") {
    await user.type(screen.getByRole("textbox", { name: "Description" }), description);
  }
  await user.click(screen.getByRole("button", { name: "Add Todo" }));
}
