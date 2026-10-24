import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";
import { TEST_TODO } from "@test/vitest/fixtures/todos";

import { copyTodo } from "../copy-todo";

describe("copy todo client operation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a failure result when clipboard access is denied", async () => {
    expect.hasAssertions();

    // Arrange
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn<(text: string) => Promise<void>>().mockRejectedValue(new Error("denied")),
      },
    });

    // Act
    const result = await copyTodo(TEST_TODO);

    // Assert
    expect(result.status).toBe("error");
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error?.code).toBe("CLIPBOARD_WRITE_FAILED");
  });

  it("returns success after writing the todo title", async () => {
    expect.hasAssertions();

    // Arrange
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    // Act
    const result = await copyTodo(TEST_TODO);

    // Assert
    expect(result).toStrictEqual({ data: TEST_TODO.title, status: "success" });
    expect(writeText).toHaveBeenCalledWith(TEST_TODO.title);
  });
});
