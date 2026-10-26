import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { routeTree } from "@/app/routeTree.gen";

vi.mock(import("@/app/styles/styles.css?url"), () => ({ default: "/styles.css" }));

vi.mock(import("@tanstack/react-devtools"));

describe("about route", () => {
  it("renders the page heading", async () => {
    expect.assertions(1);

    // Arrange
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/about"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, { container: document });

    // Assert
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "A small starter with room to grow.",
    );
  });

  it("explains what TanStack Start provides", async () => {
    expect.assertions(1);

    // Arrange
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/about"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, { container: document });

    // Assert
    expect(screen.getByText(/TanStack Start gives you type-safe routing/u)).toBeDefined();
  });
});
