import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { TodoFilters, type TodoFilter } from "@/pages/todos/ui/todo-filters";

const mockCounts = { active: 3, all: 5, completed: 2 };

describe("todo filters component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("displays status tabs and badge counts correctly", () => {
    expect.assertions(3);

    // Arrange
    const handleChange = vi.fn<(filter: TodoFilter) => void>();

    // Act
    render(<TodoFilters counts={mockCounts} filter="all" onFilterChange={handleChange} />);

    // Assert
    expect(screen.getByRole("button", { name: /all 5/iu })).toBeDefined();
    expect(screen.getByRole("button", { name: /active 3/iu })).toBeDefined();
    expect(screen.getByRole("button", { name: /completed 2/iu })).toBeDefined();
  });

  it("calls onFilterChange when filter buttons are clicked", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    const handleChange = vi.fn<(filter: TodoFilter) => void>();
    render(<TodoFilters counts={mockCounts} filter="all" onFilterChange={handleChange} />);

    // Act
    await user.click(screen.getByRole("button", { name: /active 3/iu }));
    await user.click(screen.getByRole("button", { name: /completed 2/iu }));

    // Assert
    expect(handleChange).toHaveBeenCalledWith("active");
    expect(handleChange).toHaveBeenCalledWith("completed");
  });
});
