import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import type { TodoCompletionStatus } from "@/pages/todos";
import { TodoStatusTabs } from "@/pages/todos/ui/todo-status-tabs";

const mockCounts = { active: 3, all: 5, completed: 2 };

describe("todo status tabs component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("displays filter buttons and badge counts correctly", () => {
    expect.assertions(4);

    // Arrange
    const handleChange = vi.fn<(status: TodoCompletionStatus) => void>();

    // Act
    render(<TodoStatusTabs counts={mockCounts} onStatusChange={handleChange} status="all" />);

    // Assert
    expect(screen.getByRole("navigation", { name: /filter todos by status/iu })).toBeDefined();
    expect(screen.getByRole("button", { name: /all 5/iu, pressed: true })).toBeDefined();
    expect(screen.getByRole("button", { name: /active 3/iu, pressed: false })).toBeDefined();
    expect(screen.getByRole("button", { name: /completed 2/iu, pressed: false })).toBeDefined();
  });

  it("calls onStatusChange when status buttons are clicked", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    const handleChange = vi.fn<(status: TodoCompletionStatus) => void>();
    render(<TodoStatusTabs counts={mockCounts} onStatusChange={handleChange} status="all" />);

    // Act
    await user.click(screen.getByRole("button", { name: /active 3/iu }));
    await user.click(screen.getByRole("button", { name: /completed 2/iu }));

    // Assert
    expect(handleChange).toHaveBeenCalledWith("active");
    expect(handleChange).toHaveBeenCalledWith("completed");
  });
});
