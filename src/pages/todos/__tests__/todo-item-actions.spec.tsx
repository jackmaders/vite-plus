import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { TodoItemActions, type TodoItemActionsProps } from "@/pages/todos/ui/todo-item-actions";

type DeleteFn = TodoItemActionsProps["onDelete"];
type EditFn = TodoItemActionsProps["onEdit"];

describe("todo item actions rendering and states", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders edit and delete buttons", () => {
    expect.assertions(2);

    // Arrange
    const handleDelete = vi.fn<DeleteFn>();
    const handleEdit = vi.fn<EditFn>();

    // Act
    render(<TodoItemActions onDelete={handleDelete} onEdit={handleEdit} />);

    // Assert
    expect(screen.getByRole("button", { name: /edit todo/iu })).toBeDefined();
    expect(screen.getByRole("button", { name: /delete todo/iu })).toBeDefined();
  });

  it("disables edit and delete buttons when isUpdating is true", () => {
    expect.assertions(2);

    // Arrange
    const handleDelete = vi.fn<DeleteFn>();
    const handleEdit = vi.fn<EditFn>();

    // Act
    render(<TodoItemActions isUpdating onDelete={handleDelete} onEdit={handleEdit} />);

    // Assert
    expect(screen.getByRole("button", { name: /edit todo/iu }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: /delete todo/iu }).hasAttribute("disabled")).toBe(
      true,
    );
  });
});

describe("todo item actions interactions", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("calls onEdit when edit button is clicked", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    const handleEdit = vi.fn<EditFn>();
    render(<TodoItemActions onDelete={vi.fn<DeleteFn>()} onEdit={handleEdit} />);

    // Act
    await user.click(screen.getByRole("button", { name: /edit todo/iu }));

    // Assert
    expect(handleEdit).toHaveBeenCalledOnce();
  });

  it("calls onDelete when delete button is clicked", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    const handleDelete = vi.fn<DeleteFn>();
    render(<TodoItemActions onDelete={handleDelete} onEdit={vi.fn<EditFn>()} />);

    // Act
    await user.click(screen.getByRole("button", { name: /delete todo/iu }));

    // Assert
    expect(handleDelete).toHaveBeenCalledOnce();
  });
});
