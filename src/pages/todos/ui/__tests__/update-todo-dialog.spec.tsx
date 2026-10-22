import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useUpdateTodo } from "@/pages/todos/api/use-update-todo";
import { UpdateTodoDialog } from "@/pages/todos/ui/update-todo-dialog";
import { TEST_TODO } from "@test/vitest/fixtures/todos";

vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));
vi.mock(import("@/pages/todos/api/use-update-todo"));

const mockTodo = TEST_TODO;
const mockUpdateTodo = vi.fn<() => void>();

describe("update todo dialog", () => {
  let successCallback: (() => void) | undefined;

  beforeEach(() => {
    mockUpdateTodo.mockClear();
    successCallback = undefined;
    vi.mocked(useUpdateTodo).mockImplementation((options) => {
      successCallback = options?.onSuccess as (() => void) | undefined;
      return {
        isPending: false,
        mutate: mockUpdateTodo,
      } as never;
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders trigger and opens dialog on click", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    render(<UpdateTodoDialog todo={mockTodo} />);

    // Assert trigger
    expect(screen.getByRole("button", { name: "Update Item" })).toBeDefined();

    // Act
    await user.click(screen.getByRole("button", { name: "Update Item" }));

    // Assert dialog opened
    expect(screen.getByRole("heading", { name: /update todo item\?/iu })).toBeDefined();
  });

  it("prepopulates form with existing todo values", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    render(<UpdateTodoDialog todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Update Item" }));

    // Assert
    expect(screen.getByDisplayValue(mockTodo.title)).toBeDefined();
    expect(screen.getByDisplayValue(mockTodo.description ?? "")).toBeDefined();
  });

  it("submits update with modified form values", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    render(<UpdateTodoDialog todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Update Item" }));
    const titleInput = screen.getByPlaceholderText("Title");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");
    await user.click(screen.getByRole("button", { name: "Update" }));

    // Assert
    expect(mockUpdateTodo).toHaveBeenCalledWith({
      data: { description: mockTodo.description, title: "Updated Title" },
      id: mockTodo.id,
    });
  });

  it("closes dialog when mutation succeeds", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    render(<UpdateTodoDialog todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Update Item" }));
    expect(screen.getByRole("heading", { name: /update todo item\?/iu })).toBeDefined();

    // Simulate mutation success callback
    act(() => {
      successCallback?.();
    });

    // Assert dialog is closed
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /update todo item\?/iu })).toBeNull();
    });
  });
});
