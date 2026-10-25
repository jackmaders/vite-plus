import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { routeTree } from "@/app/routeTree.gen";
import { getSessionFn } from "@/shared/auth";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

vi.mock(import("@/shared/auth"));
vi.mock(import("@/app/styles/styles.css?url"), () => ({ default: "/styles.css" }));
vi.mock(import("@tanstack/react-devtools"));
vi.mock(import("@tanstack/react-router-devtools"));
vi.mock(import("@tanstack/react-query-devtools"));

describe("authenticated profile route integration", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("passes server-loaded session from parent route context to profile page", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValue(TEST_SESSION);
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/profile"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, { container: document });

    // Assert
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("User Profile");
    expect(screen.getByText(/Name: Test User/u)).toBeDefined();
    expect(screen.getByText(/Email: test@example.com/u)).toBeDefined();
  });
});
