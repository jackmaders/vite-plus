import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { TodoItem, type TodoItemProps } from "@/pages/todos/ui/todo-item";
import type { Todo } from "@/shared/db";

type DeleteFn = TodoItemProps["onDelete"];
type ToggleFn = TodoItemProps["onToggle"];
type UpdateFn = TodoItemProps["onUpdate"];

const mockTodo: Todo = {
  completed: false,
  createdAt: new Date(),
  description: "Test Description",
  id: "todo-1",
  title: "Test Todo",
  updatedAt: new Date(),
  userId: "user-1",
};

describe("todo item display", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders todo title, description, and pending status", () => {
    expect.assertions(3);

    // Arrange
    const handleUpdate = vi.fn<UpdateFn>();

    // Act
    render(
      <TodoItem
        onDelete={vi.fn<DeleteFn>()}
        onToggle={vi.fn<ToggleFn>()}
        onUpdate={handleUpdate}
        todo={mockTodo}
      />,
    );

    // Assert
    expect(screen.getByText("Test Todo")).toBeDefined();
    expect(screen.getByText("Test Description")).toBeDefined();
    expect(screen.getByText("Pending")).toBeDefined();
  });

  it("renders completed todo with line-through style and done badge", () => {
    expect.assertions(2);

    // Arrange
    const completedTodo: Todo = { ...mockTodo, completed: true };

    // Act
    render(
      <TodoItem
        onDelete={vi.fn<DeleteFn>()}
        onToggle={vi.fn<ToggleFn>()}
        onUpdate={vi.fn<UpdateFn>()}
        todo={completedTodo}
      />,
    );

    // Assert
    expect(screen.getByText("Test Todo").className).toContain("line-through");
    expect(screen.getByText("Done")).toBeDefined();
  });
});

describe("todo item optional fields and states", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does not render description paragraph when description is null", () => {
    expect.assertions(1);

    // Arrange
    const todoWithoutDescription: Todo = { ...mockTodo, description: null };
    const handleDelete = vi.fn<DeleteFn>();
    const handleToggle = vi.fn<ToggleFn>();
    const handleUpdate = vi.fn<UpdateFn>();

    // Act
    render(
      <TodoItem
        onDelete={handleDelete}
        onToggle={handleToggle}
        onUpdate={handleUpdate}
        todo={todoWithoutDescription}
      />,
    );

    // Assert
    expect(screen.queryByText("Test Description")).toBeNull();
  });

  it("disables actions when isUpdating", () => {
    expect.assertions(3);

    // Arrange
    const handleUpdate = vi.fn<UpdateFn>();

    // Act
    render(
      <TodoItem
        isUpdating
        onDelete={vi.fn<DeleteFn>()}
        onToggle={vi.fn<ToggleFn>()}
        onUpdate={handleUpdate}
        todo={mockTodo}
      />,
    );

    // Assert
    expect(screen.getByRole("checkbox").getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("button", { name: /edit todo/iu }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: /delete todo/iu }).hasAttribute("disabled")).toBe(
      true,
    );
  });
});

describe("todo item interactions", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("calls onToggle with correct parameters when checkbox is clicked", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    const handleToggle = vi.fn<ToggleFn>();
    render(
      <TodoItem
        onDelete={vi.fn<DeleteFn>()}
        onToggle={handleToggle}
        onUpdate={vi.fn<UpdateFn>()}
        todo={mockTodo}
      />,
    );

    // Act
    await user.click(screen.getByRole("checkbox", { name: /toggle test todo/iu }));

    // Assert
    expect(handleToggle).toHaveBeenCalledWith("todo-1", true);
  });

  it("calls onDelete with todo id when delete button is clicked", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    const handleDelete = vi.fn<DeleteFn>();
    render(
      <TodoItem
        onDelete={handleDelete}
        onToggle={vi.fn<ToggleFn>()}
        onUpdate={vi.fn<UpdateFn>()}
        todo={mockTodo}
      />,
    );

    // Act
    await user.click(screen.getByRole("button", { name: /delete todo/iu }));

    // Assert
    expect(handleDelete).toHaveBeenCalledWith("todo-1");
  });
});

describe("todo item saving", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("edits title and saves updates", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    const handleUpdate = vi.fn<UpdateFn>();
    render(
      <TodoItem
        onDelete={vi.fn<DeleteFn>()}
        onToggle={vi.fn<ToggleFn>()}
        onUpdate={handleUpdate}
        todo={mockTodo}
      />,
    );

    // Act
    await user.click(screen.getByRole("button", { name: /edit todo/iu }));
    await user.type(screen.getByPlaceholderText("Title"), " Extra");
    await user.click(screen.getByRole("button", { name: /save/iu }));

    // Assert
    expect(handleUpdate).toHaveBeenCalledWith("todo-1", {
      description: "Test Description",
      title: "Test Todo Extra",
    });
    expect(screen.queryByPlaceholderText("Title")).toBeNull();
  });

  it("omits description when cleared to whitespace on save", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    const handleUpdate = vi.fn<UpdateFn>();
    render(
      <TodoItem
        onDelete={vi.fn<DeleteFn>()}
        onToggle={vi.fn<ToggleFn>()}
        onUpdate={handleUpdate}
        todo={mockTodo}
      />,
    );

    // Act
    await user.click(screen.getByRole("button", { name: /edit todo/iu }));
    await user.clear(screen.getByPlaceholderText("Description"));
    await user.click(screen.getByRole("button", { name: /save/iu }));

    // Assert
    expect(handleUpdate).toHaveBeenCalledWith("todo-1", {
      title: "Test Todo",
    });
  });
});

describe("todo item edit controls", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("disables save button when title is cleared to whitespace", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    render(
      <TodoItem
        onDelete={vi.fn<DeleteFn>()}
        onToggle={vi.fn<ToggleFn>()}
        onUpdate={vi.fn<UpdateFn>()}
        todo={mockTodo}
      />,
    );

    // Act
    await user.click(screen.getByRole("button", { name: /edit todo/iu }));
    await user.clear(screen.getByPlaceholderText("Title"));

    // Assert
    expect(screen.getByRole("button", { name: /save/iu }).hasAttribute("disabled")).toBe(true);
  });

  it("cancels edit mode without calling onUpdate when cancel button is clicked", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    const handleUpdate = vi.fn<UpdateFn>();
    render(
      <TodoItem
        onDelete={vi.fn<DeleteFn>()}
        onToggle={vi.fn<ToggleFn>()}
        onUpdate={handleUpdate}
        todo={mockTodo}
      />,
    );

    // Act
    await user.click(screen.getByRole("button", { name: /edit todo/iu }));
    await user.click(screen.getByRole("button", { name: /cancel/iu }));

    // Assert
    expect(handleUpdate).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText("Title")).toBeNull();
  });

  it("resets discarded edits to current todo values when cancelled and reopened", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    render(
      <TodoItem
        onDelete={vi.fn<DeleteFn>()}
        onToggle={vi.fn<ToggleFn>()}
        onUpdate={vi.fn<UpdateFn>()}
        todo={mockTodo}
      />,
    );

    // Act
    await user.click(screen.getByRole("button", { name: /edit todo/iu }));
    await user.type(screen.getByPlaceholderText("Title"), " Changed");
    await user.click(screen.getByRole("button", { name: /cancel/iu }));
    await user.click(screen.getByRole("button", { name: /edit todo/iu }));

    // Assert
    expect(screen.getByPlaceholderText("Title").getAttribute("value")).toBe("Test Todo");
    expect(screen.queryByText("Test Todo Changed")).toBeNull();
  });
});
