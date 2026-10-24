import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";
import { TEST_TODO } from "@test/vitest/fixtures/todos";

import { copyTodo } from "../../lib/copy-todo";
import { CopyTodoButton } from "../copy-todo-button";

vi.mock(import("../../lib/copy-todo"));

describe("copy todo feedback", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("handles the failure result as inline feedback", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    vi.mocked(copyTodo).mockResolvedValue({
      error: new ApplicationError("CLIPBOARD_WRITE_FAILED", "Copy failed"),
      status: "error",
    });
    render(<CopyTodoButton todo={TEST_TODO} />);

    // Act
    await user.click(screen.getByRole("button", { name: `Copy ${TEST_TODO.title}` }));

    // Assert
    expect(screen.getByRole("alert").textContent).toBe("Copy failed");
  });

  it("recovers from a failure on the next copy attempt", async () => {
    expect.hasAssertions();
    // Arrange
    const user = userEvent.setup();
    vi.mocked(copyTodo)
      .mockResolvedValueOnce({
        error: new ApplicationError("COPY_FAILED", "Copy failed"),
        status: "error",
      })
      .mockResolvedValueOnce({ data: TEST_TODO.title, status: "success" });
    render(<CopyTodoButton todo={TEST_TODO} />);

    // Act
    await user.click(screen.getByRole("button", { name: `Copy ${TEST_TODO.title}` }));
    await user.click(screen.getByRole("button", { name: `Copy ${TEST_TODO.title}` }));

    // Assert
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Copied");
  });
});
