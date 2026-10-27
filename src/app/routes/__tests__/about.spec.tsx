import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { routeTree } from "@/app/routeTree.gen";

vi.mock(import("@/shared/auth"));

vi.mock(import("@/app/styles/index.css?url"), () => ({ default: "/index.css" }));

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
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("About");
  });

  it("explains what the application provides", async () => {
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
    expect(screen.getByText(/This application is built with TanStack Start/u)).toBeDefined();
  });
});
