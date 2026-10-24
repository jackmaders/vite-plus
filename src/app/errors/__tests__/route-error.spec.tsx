import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { NotFoundError } from "@/shared/errors";

import { RouteError } from "../route-error";

vi.mock(import("@tanstack/react-router"), async (importOriginal) => ({
  ...(await importOriginal()),
  useRouter: vi.fn<() => ReturnType<typeof useRouter>>() as typeof useRouter,
}));

describe("route error recovery", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows a safe message and retries the route", async () => {
    expect.hasAssertions();
    // Arrange
    const user = userEvent.setup();
    const invalidate = vi.fn<() => Promise<void>>().mockResolvedValue();
    vi.mocked(useRouter).mockReturnValue({ invalidate } as never);
    const reset = vi.fn<() => void>();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouteError error={new NotFoundError("MISSING", "Record not found")} reset={reset} />
      </QueryClientProvider>,
    );

    // Act
    await user.click(screen.getByRole("button", { name: "Try again" }));

    // Assert
    expect(screen.getByRole("alert").textContent).toBe("Record not found");
    expect(reset).toHaveBeenCalledOnce();
    expect(invalidate).toHaveBeenCalledOnce();
  });
});
