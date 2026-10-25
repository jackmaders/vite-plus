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

  it("renders user information immediately when initial session is provided", () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(useSession).mockReturnValue({
      data: null,
      error: null,
      isPending: true,
    } as unknown as SessionHookResult);

    // Act
    render(<ProfilePage initialSession={TEST_SESSION} />);

    // Assert
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("User Profile");
    expect(screen.getByText(/Name: Test User/u)).toBeDefined();
    expect(screen.getByText(/Email: test@example.com/u)).toBeDefined();
  });

  it("renders user information when session is loaded via hook without initial session", () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(useSession).mockReturnValue({
      data: TEST_SESSION,
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

  it("renders signed-out message instead of loading when session is confirmed null and not pending", () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(useSession).mockReturnValue({
      data: null,
      error: null,
      isPending: false,
    } as unknown as SessionHookResult);

    // Act
    render(<ProfilePage />);

    // Assert
    expect(screen.getByText("You are not signed in.")).toBeDefined();
  });

  it("renders error message when session fetch fails", () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(useSession).mockReturnValue({
      data: null,
      error: new Error("Network error"),
      isPending: false,
    } as unknown as SessionHookResult);

    // Act
    render(<ProfilePage />);

    // Assert
    expect(screen.getByText("Failed to load session details.")).toBeDefined();
  });
});
