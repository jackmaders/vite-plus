import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { ProfilePage } from "@/pages/profile";
import { useSession } from "@/shared/auth/index.client";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

vi.mock(import("@/shared/auth/index.client"));

type SessionHookResult = ReturnType<typeof useSession>;

describe("profile page component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders user information when session is loaded", () => {
    expect.assertions(3);

    // Arrange
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    vi.mocked(useSession).mockReturnValue({
      data: TEST_SESSION,
      // oxlint-disable-next-line unicorn/no-null
      error: null,
      isPending: false,
    } as unknown as SessionHookResult);

    // Act
    render(<ProfilePage />);

    // Assert
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("User Profile");
    expect(screen.getByText(/Name: Test User/u)).toBeDefined();
    expect(screen.getByText(/Email: test@example.com/u)).toBeDefined();
  });

  it("renders loading message when session details are not yet available", () => {
    expect.assertions(1);

    // Arrange
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    vi.mocked(useSession).mockReturnValue({
      // oxlint-disable-next-line unicorn/no-null
      data: null,
      // oxlint-disable-next-line unicorn/no-null
      error: null,
      isPending: true,
    } as unknown as SessionHookResult);

    // Act
    render(<ProfilePage />);

    // Assert
    expect(screen.getByText("Loading session details...")).toBeDefined();
  });
});
