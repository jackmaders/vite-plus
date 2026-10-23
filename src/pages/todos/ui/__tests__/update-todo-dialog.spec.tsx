import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useUpdateTodo } from "@/pages/todos/api/use-update-todo";
import { UpdateTodoDialog } from "@/pages/todos/ui/update-todo-dialog";
import { TEST_TODO } from "@test/vitest/fixtures/todos";

vi.mock(import("@/pages/todos/api/use-update-todo"));

const mockTodo = TEST_TODO;
const mockUpdateTodo = vi.fn<() => Promise<void>>();

async function openAndEditTitle(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.click(screen.getByRole("button", { name: "Update Item" }));
  const titleInput = screen.getByPlaceholderText<HTMLInputElement>("Title");
  await user.clear(titleInput);
  await user.type(titleInput, title);
  return titleInput;
}

describe("update todo dialog", () => {
  beforeEach(() => {
    mockUpdateTodo.mockClear();
    mockUpdateTodo.mockResolvedValue();
    vi.mocked(useUpdateTodo).mockReturnValue({
      isPending: false,
      mutate: mockUpdateTodo,
      mutateAsync: mockUpdateTodo,
    } as never);
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
    expect(screen.getByDisplayValue("Test Description")).toBeDefined();
  });

  it("submits update with modified form values", async () => {
    expect.hasAssertions();

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
    await waitFor(() => {
      expect(mockUpdateTodo).toHaveBeenCalledWith({
        data: { description: mockTodo.description, title: "Updated Title" },
        id: mockTodo.id,
      });
    });
  });

  it("closes dialog when mutation succeeds", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    render(<UpdateTodoDialog todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Update Item" }));
    expect(screen.getByRole("heading", { name: /update todo item\?/iu })).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Update" }));

    // Assert dialog is closed
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /update todo item\?/iu })).toBeNull();
    });
    expect(mockUpdateTodo).toHaveBeenCalledOnce();
  });

  it("keeps the dialog and edited values when the save fails", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    mockUpdateTodo.mockRejectedValueOnce(new Error("save failed"));
    render(<UpdateTodoDialog todo={mockTodo} />);
    const titleInput = await openAndEditTitle(user, "Draft title");

    // Act
    await user.click(screen.getByRole("button", { name: "Update" }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Something went wrong. Please try again.")).toBeDefined();
    });
    expect(titleInput.value).toBe("Draft title");
    expect(screen.getByRole("heading", { name: /update todo item\?/iu })).toBeDefined();
  });

  it("does not call the update mutation when validation rejects the edited value", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    render(<UpdateTodoDialog todo={mockTodo} />);
    const titleInput = await openAndEditTitle(user, "   ");

    // Act
    await user.click(screen.getByRole("button", { name: "Update" }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeDefined();
    });
    expect(titleInput.value).toBe("   ");
    expect(mockUpdateTodo).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: /update todo item\?/iu })).toBeDefined();
  });

  it("handles empty description fallback", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    render(<UpdateTodoDialog todo={{ ...mockTodo, description: null }} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Update Item" }));

    // Assert
    const descriptionInput = screen.getByPlaceholderText<HTMLInputElement>("Description");
    expect(descriptionInput.value).toBe("");
  });

  it("closes dialog when cancel button is clicked", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    render(<UpdateTodoDialog todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Update Item" }));
    expect(screen.getByRole("heading", { name: /update todo item\?/iu })).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    // Assert dialog is closed
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /update todo item\?/iu })).toBeNull();
    });
  });
});
