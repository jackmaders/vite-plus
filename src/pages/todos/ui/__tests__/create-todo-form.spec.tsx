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

  it("shows a submission error when creating a todo fails", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    mockCreateTodo.mockRejectedValueOnce(new Error("save failed"));
    render(<CreateTodoForm />);

    // Act
    await fillAndSubmit(user, "New Todo");
    const error = await screen.findByText("Something went wrong. Please try again.");

    // Assert
    expect(error).toBeDefined();
  });

  it("submits title and description, calls createTodo, and resets inputs", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const handleSubmit = vi.fn<(event: unknown) => void>();
    render(<CreateTodoForm onSubmit={handleSubmit} />);

    // Act
    await fillAndSubmit(user, "New Todo", "New Description");

    // Assert
    expect(mockCreateTodo).toHaveBeenCalledWith({
      description: "New Description",
      title: "New Todo",
    });
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledOnce();
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
    await user.type(screen.getByPlaceholderText("Title"), "   ");
    fireEvent.submit(screen.getByPlaceholderText("Title"));

    // Assert
    expect(mockCreateTodo).not.toHaveBeenCalled();
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
