import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useCreateTodo } from "@/pages/todos/api/use-create-todo";
import { CreateTodoForm } from "@/pages/todos/ui/create-todo-form";

vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));
vi.mock(import("@/pages/todos/api/use-create-todo"));

const mockCreateTodo = vi.fn<() => Promise<void>>();

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
  description?: string,
) {
  await user.type(screen.getByPlaceholderText("Title"), title);
  if (typeof description === "string") {
    await user.type(screen.getByPlaceholderText("Description"), description);
  }
  await user.click(screen.getByRole("button", { name: /add todo/iu }));
}

async function fillAndSubmitInvalidTitle(user: ReturnType<typeof userEvent.setup>, title: string) {
  const titleInput = screen.getByPlaceholderText<HTMLInputElement>("Title");
  await user.type(titleInput, title);
  fireEvent.submit(titleInput);
}

describe("todo form submission", () => {
  beforeEach(() => {
    mockCreateTodo.mockClear();
    mockCreateTodo.mockResolvedValue();
    vi.mocked(useCreateTodo).mockReturnValue({
      isError: false,
      isPending: false,
      isSuccess: false,
      mutate: mockCreateTodo,
      mutateAsync: mockCreateTodo,
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("submits title and description, calls createTodo, and resets inputs", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onSuccess = vi.fn<() => void>();
    render(<CreateTodoForm onSuccess={onSuccess} />);

    // Act
    await fillAndSubmit(user, "New Todo", "New Description");

    // Assert
    expect(mockCreateTodo).toHaveBeenCalledWith({
      description: "New Description",
      title: "New Todo",
    });
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
      expect(screen.getByPlaceholderText("Title").getAttribute("value")).toBe("");
      expect(screen.getByPlaceholderText("Description").getAttribute("value")).toBe("");
    });
  });

  it("submits without description when submitted with empty description", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    render(<CreateTodoForm />);

    // Act
    await fillAndSubmit(user, "Title Only");

    // Assert
    expect(mockCreateTodo).toHaveBeenCalledWith({ description: "", title: "Title Only" });
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Title").getAttribute("value")).toBe("");
    });
  });

  it("preserves the draft and skips success effects when the save fails", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onSuccess = vi.fn<() => void>();
    mockCreateTodo.mockRejectedValueOnce(new Error("save failed"));
    render(<CreateTodoForm onSuccess={onSuccess} />);

    // Act
    await fillAndSubmit(user, "Draft title");

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Something went wrong. Please try again.")).toBeDefined();
    });
    expect(screen.getByPlaceholderText<HTMLInputElement>("Title").value).toBe("Draft title");
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe("todo form validation", () => {
  beforeEach(() => {
    mockCreateTodo.mockClear();
    mockCreateTodo.mockResolvedValue();
    vi.mocked(useCreateTodo).mockReturnValue({
      isError: false,
      isPending: false,
      isSuccess: false,
      mutate: mockCreateTodo,
      mutateAsync: mockCreateTodo,
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does not call createTodo when form is submitted with whitespace title", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    render(<CreateTodoForm />);

    // Act
    await fillAndSubmitInvalidTitle(user, "   ");

    // Assert
    expect(mockCreateTodo).not.toHaveBeenCalled();
  });

  it("preserves the draft and validation feedback when submission is invalid", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const onSuccess = vi.fn<() => void>();
    render(<CreateTodoForm onSuccess={onSuccess} />);

    // Act
    await fillAndSubmitInvalidTitle(user, "   ");

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeDefined();
    });
    expect(screen.getByPlaceholderText<HTMLInputElement>("Title").value).toBe("   ");
    expect(mockCreateTodo).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe("todo form states", () => {
  beforeEach(() => {
    mockCreateTodo.mockClear();
    mockCreateTodo.mockResolvedValue();
    vi.mocked(useCreateTodo).mockReturnValue({
      isError: false,
      isPending: false,
      isSuccess: false,
      mutate: mockCreateTodo,
      mutateAsync: mockCreateTodo,
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("disables submit button when title is whitespace only or empty", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    render(<CreateTodoForm />);
    const submitButton = screen.getByRole("button", { name: /add todo/iu });

    // Assert - initially empty
    expect(submitButton.hasAttribute("disabled")).toBe(true);

    // Act
    await user.type(screen.getByPlaceholderText("Title"), "   ");

    // Assert - whitespace only
    expect(submitButton.hasAttribute("disabled")).toBe(true);
  });
});
