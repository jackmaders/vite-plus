import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { TodoForm, type TodoFormProps } from "@/pages/todos/ui/todo-form";

type CreateFn = TodoFormProps["onCreate"];

describe("todo form submission", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("submits title and description, calls onCreate, and resets inputs", async () => {
    expect.assertions(3);

    // Arrange
    const user = userEvent.setup();
    const handleCreate = vi.fn<CreateFn>();
    render(<TodoForm onCreate={handleCreate} />);

    // Act
    await user.type(screen.getByPlaceholderText("Title"), "New Todo");
    await user.type(screen.getByPlaceholderText("Description"), "New Description");
    await user.click(screen.getByRole("button", { name: /add todo/iu }));

    // Assert
    expect(handleCreate).toHaveBeenCalledWith({
      description: "New Description",
      title: "New Todo",
    });
    expect(screen.getByPlaceholderText("Title").getAttribute("value")).toBe("");
    expect(screen.getByPlaceholderText("Description").getAttribute("value")).toBe("");
  });

  it("omits description when submitted with whitespace description", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    const handleCreate = vi.fn<CreateFn>();
    render(<TodoForm onCreate={handleCreate} />);

    // Act
    await user.type(screen.getByPlaceholderText("Title"), "Title Only");
    await user.type(screen.getByPlaceholderText("Description"), "   ");
    await user.click(screen.getByRole("button", { name: /add todo/iu }));

    // Assert
    expect(handleCreate).toHaveBeenCalledWith({ title: "Title Only" });
    expect(screen.getByPlaceholderText("Title").getAttribute("value")).toBe("");
  });
});

describe("todo form validation", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does not call onCreate when form is submitted with whitespace title", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    const handleCreate = vi.fn<CreateFn>();
    render(<TodoForm onCreate={handleCreate} />);

    // Act
    await user.type(screen.getByPlaceholderText("Title"), "   ");
    fireEvent.submit(screen.getByPlaceholderText("Title"));

    // Assert
    expect(handleCreate).not.toHaveBeenCalled();
  });
});

describe("todo form states", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("disables submit button when title is whitespace only or empty", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    render(<TodoForm onCreate={vi.fn<CreateFn>()} />);
    const submitButton = screen.getByRole("button", { name: /add todo/iu });

    // Assert - initially empty
    expect(submitButton.hasAttribute("disabled")).toBe(true);

    // Act
    await user.type(screen.getByPlaceholderText("Title"), "   ");

    // Assert - whitespace only
    expect(submitButton.hasAttribute("disabled")).toBe(true);
  });

  it("disables inputs and button and shows loading state when isCreating", () => {
    expect.assertions(3);

    // Arrange
    const handleCreate = vi.fn<CreateFn>();

    // Act
    render(<TodoForm isCreating onCreate={handleCreate} />);

    // Assert
    expect(screen.getByPlaceholderText("Title").hasAttribute("disabled")).toBe(true);
    expect(screen.getByPlaceholderText("Description").hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: /adding\.\.\./iu }).hasAttribute("disabled")).toBe(
      true,
    );
  });
});
