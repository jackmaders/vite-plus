import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { routeTree } from "@/routeTree.gen";

vi.mock(import("@tanstack/react-devtools"));

describe("about route", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the page heading", async () => {
    expect.assertions(1);

    // Arrange
    const router = createRouter({
      history: createMemoryHistory({ initialEntries: ["/about"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, {});

    // Assert
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "A small starter with room to grow.",
    );
  });

  it("explains what TanStack Start provides", async () => {
    expect.assertions(1);

    // Arrange
    const router = createRouter({
      history: createMemoryHistory({ initialEntries: ["/about"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, {});

    // Assert
    expect(screen.getByText(/TanStack Start gives you type-safe routing/u)).toBeDefined();
  });
});
