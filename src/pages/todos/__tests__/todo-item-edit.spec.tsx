import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { TodoItemEdit, type TodoItemEditProps } from "@/pages/todos/ui/todo-item-edit";
import type { Todo } from "@/shared/db";
import { createTodoFixture } from "@test/vitest/fixtures/todos";

type CancelFn = TodoItemEditProps["onCancel"];
type SaveFn = TodoItemEditProps["onSave"];

const mockTodo = createTodoFixture({
  description: "Initial Description",
  title: "Initial Title",
});

describe("todo item edit rendering and input handling", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders with initial todo title and description", () => {
    expect.assertions(2);

    // Arrange
    const handleCancel = vi.fn<CancelFn>();
    const handleSave = vi.fn<SaveFn>();

    // Act
    render(<TodoItemEdit onCancel={handleCancel} onSave={handleSave} todo={mockTodo} />);

    // Assert
    expect(screen.getByPlaceholderText("Title").getAttribute("value")).toBe("Initial Title");
    expect(screen.getByPlaceholderText("Description").getAttribute("value")).toBe(
      "Initial Description",
    );
  });

  it("renders empty description when todo description is null", () => {
    expect.assertions(1);

    // Arrange
    const todoWithoutDesc: Todo = { ...mockTodo, description: null };

    // Act
    render(
      <TodoItemEdit onCancel={vi.fn<CancelFn>()} onSave={vi.fn<SaveFn>()} todo={todoWithoutDesc} />,
    );

    // Assert
    expect(screen.getByPlaceholderText("Description").getAttribute("value")).toBe("");
  });
});

describe("todo item edit saving and validation", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("calls onSave with updated title and description when save is clicked", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    const handleSave = vi.fn<SaveFn>();
    render(<TodoItemEdit onCancel={vi.fn<CancelFn>()} onSave={handleSave} todo={mockTodo} />);

    // Act
    await user.clear(screen.getByPlaceholderText("Title"));
    await user.type(screen.getByPlaceholderText("Title"), "Updated Title");
    await user.clear(screen.getByPlaceholderText("Description"));
    await user.type(screen.getByPlaceholderText("Description"), "Updated Description");
    await user.click(screen.getByRole("button", { name: /save/iu }));

    // Assert
    expect(handleSave).toHaveBeenCalledWith({
      description: "Updated Description",
      title: "Updated Title",
    });
  });

  it("calls onSave with title only when description is whitespace", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    const handleSave = vi.fn<SaveFn>();
    render(<TodoItemEdit onCancel={vi.fn<CancelFn>()} onSave={handleSave} todo={mockTodo} />);

    // Act
    await user.clear(screen.getByPlaceholderText("Description"));
    await user.type(screen.getByPlaceholderText("Description"), "   ");
    await user.click(screen.getByRole("button", { name: /save/iu }));

    // Assert
    expect(handleSave).toHaveBeenCalledWith({
      title: "Initial Title",
    });
  });

  it("disables save button when title is empty or whitespace", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    render(<TodoItemEdit onCancel={vi.fn<CancelFn>()} onSave={vi.fn<SaveFn>()} todo={mockTodo} />);

    // Act
    await user.clear(screen.getByPlaceholderText("Title"));
    const saveButton = screen.getByRole("button", { name: /save/iu });

    // Assert
    expect(saveButton.hasAttribute("disabled")).toBe(true);
  });
});

describe("todo item edit cancel and disabled states", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("calls onCancel and resets fields when cancel is clicked", async () => {
    expect.assertions(3);

    // Arrange
    const user = userEvent.setup();
    const handleCancel = vi.fn<CancelFn>();
    render(<TodoItemEdit onCancel={handleCancel} onSave={vi.fn<SaveFn>()} todo={mockTodo} />);

    // Act
    await user.type(screen.getByPlaceholderText("Title"), " Modified");
    await user.click(screen.getByRole("button", { name: /cancel/iu }));

    // Assert
    expect(handleCancel).toHaveBeenCalledWith();
    expect(screen.getByPlaceholderText("Title").getAttribute("value")).toBe("Initial Title");
    expect(screen.getByPlaceholderText("Description").getAttribute("value")).toBe(
      "Initial Description",
    );
  });

  it("resets description to empty string when cancelled for todo without description", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    const handleCancel = vi.fn<CancelFn>();
    const todoWithoutDesc: Todo = { ...mockTodo, description: null };
    render(
      <TodoItemEdit onCancel={handleCancel} onSave={vi.fn<SaveFn>()} todo={todoWithoutDesc} />,
    );

    // Act
    await user.type(screen.getByPlaceholderText("Description"), "Draft Description");
    await user.click(screen.getByRole("button", { name: /cancel/iu }));

    // Assert
    expect(handleCancel).toHaveBeenCalledWith();
    expect(screen.getByPlaceholderText("Description").getAttribute("value")).toBe("");
  });

  it("disables inputs and buttons when isUpdating", () => {
    expect.assertions(4);

    // Arrange
    const handleCancel = vi.fn<CancelFn>();
    const handleSave = vi.fn<SaveFn>();

    // Act
    render(<TodoItemEdit isUpdating onCancel={handleCancel} onSave={handleSave} todo={mockTodo} />);

    // Assert
    expect(screen.getByPlaceholderText("Title").hasAttribute("disabled")).toBe(true);
    expect(screen.getByPlaceholderText("Description").hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: /cancel/iu }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: /save/iu }).hasAttribute("disabled")).toBe(true);
  });
});
