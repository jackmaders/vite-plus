import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { createTodoFn } from "@/pages/todos/api/todos.functions";
import { CreateTodoForm } from "@/pages/todos/ui/create-todo-form";
import { ApplicationError, applicationErrorAdapter } from "@/shared/errors";
import { toast } from "@/shared/ui/shadcn/toast";
import { TEST_TODO } from "@test/vitest/fixtures/todos";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { getRouter } from "../router";

vi.mock(import("@tanstack/react-router-ssr-query"));

vi.mock(import("@/pages/todos/api/todos.functions"));
vi.mock(import("@/shared/ui/shadcn/toast"));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("create todo failure recovery", () => {
  it("preserves the draft and allows retry after editing with a default toast", async () => {
    expect.hasAssertions();
    // Arrange
    const { user, title } = await setupFailedCreate();

    // Act
    await user.click(screen.getByRole("button", { name: "Add Todo" }));
    const error = await screen.findByRole("alert");

    // Assert
    expect(error.textContent).toBe("Todo item could not be created.");
    expect({
      description: screen.getByLabelText<HTMLInputElement>("Description").value,
      title: title.value,
    }).toStrictEqual({ description: "Draft description", title: "Draft title" });
    expect(toast.add).toHaveBeenCalledOnce();

    // Act
    await retryAfterEditing(user, title);

    // Assert
    await waitFor(() => {
      expect(title.value).toBe("");
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

async function setupFailedCreate() {
  const user = userEvent.setup();
  const failure = applicationErrorAdapter.fromSerializable(
    applicationErrorAdapter.toSerializable(
      new ApplicationError("TODO_CREATE_FAILED", { message: "private override" }),
    ),
  );
  vi.mocked(createTodoFn).mockRejectedValueOnce(failure).mockResolvedValueOnce(TEST_TODO);
  const { wrapper } = createTestingWrapper({
    queryClient: getRouter().options.context.queryClient,
  });
  render(<CreateTodoForm />, { wrapper });
  const title = screen.getByLabelText<HTMLInputElement>("Title");
  await user.type(title, "Draft title");
  await user.type(screen.getByLabelText("Description"), "Draft description");
  return { title, user };
}

async function retryAfterEditing(
  user: ReturnType<typeof userEvent.setup>,
  title: HTMLInputElement,
) {
  await user.type(title, " revised");
  await user.click(screen.getByRole("button", { name: "Add Todo" }));
}
