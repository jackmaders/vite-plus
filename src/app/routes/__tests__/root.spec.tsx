import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { routeTree } from "@/app/routeTree.gen";

vi.mock(import("@tanstack/react-devtools"));
vi.mock(import("@tanstack/react-router-devtools"));
vi.mock(import("@tanstack/react-query-devtools"));

describe("root route document metadata", () => {
  afterEach(() => {
    cleanup();
  });

  it("sets the title and viewport metadata", async () => {
    expect.assertions(2);

    // Arrange
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, {});
    const viewportContent = Array.from(
      // Viewport metadata has no accessible Testing Library query.
      // oxlint-disable-next-line testing-library/no-node-access
      document.querySelectorAll('meta[name="viewport"]'),
      (viewport) => viewport.getAttribute("content"),
    );

    // Assert
    expect(document.title).toBe("TanStack Start Starter");
    expect(viewportContent).toStrictEqual(["width=device-width, initial-scale=1"]);
  });
});

describe("root route layout", () => {
  afterEach(() => {
    cleanup();
  });

  it("wraps the current page with the site header and footer", async () => {
    expect.assertions(3);

    // Arrange
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, {});

    // Assert
    expect(screen.getByRole("banner")).toBeDefined();
    expect(screen.getByRole("main")).toBeDefined();
    expect(screen.getByRole("contentinfo")).toBeDefined();
  });
});

describe("root route devtools panels", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the router and react-query devtools panels", async () => {
    expect.assertions(2);

    // Arrange
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, {});

    // Assert
    expect(screen.getByText("Router Devtools Panel")).toBeDefined();
    expect(screen.getByText("React Query Devtools Panel")).toBeDefined();
  });
});
