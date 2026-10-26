import { QueryClient } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { routeTree } from "@/app/routeTree.gen";
import { ServerErrorPage } from "@/pages/server-error";

vi.mock(import("@/app/styles/styles.css?url"), () => ({ default: "/styles.css" }));

vi.mock(import("@tanstack/react-devtools"));
vi.mock(import("@tanstack/react-router-devtools"));
vi.mock(import("@tanstack/react-query-devtools"));

describe("root route document metadata", () => {
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
    render(<RouterProvider router={router} />, { container: document });
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
    render(<RouterProvider router={router} />, { container: document });

    // Assert
    expect(screen.getByRole("banner")).toBeDefined();
    expect(screen.getByRole("main")).toBeDefined();
    expect(screen.getByRole("contentinfo")).toBeDefined();
  });
});

describe("root route devtools panels", () => {
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
    render(<RouterProvider router={router} />, { container: document });

    // Assert
    expect(screen.getByText("Router Devtools Panel")).toBeDefined();
    expect(screen.getByText("React Query Devtools Panel")).toBeDefined();
  });
});

describe("root route notFoundComponent", () => {
  it("renders the not found page for an unrecognised route", async () => {
    expect.assertions(3);

    // Arrange
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/non-existent-page"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, { container: document });

    // Assert
    expect(screen.getByRole("heading", { name: "Page Not Found" })).toBeDefined();
    expect(
      screen.getByText("The page you are looking for does not exist or has been moved."),
    ).toBeDefined();
    expect(screen.getByRole("link", { name: "Return Home" }).getAttribute("href")).toBe("/");
  });
});

describe("route error boundary", () => {
  it("shows generic messaging without exposing the route error", async () => {
    expect.assertions(2);

    // Arrange
    const { router } = createFailedRoute();

    // Act
    await router.load();
    render(<RouterProvider router={router} />);

    // Assert
    expect(screen.getByText("Something went wrong. Please try again.")).toBeDefined();
    expect(screen.queryByText("private server detail")).toBeNull();
  });
});

function createFailedRoute() {
  const loader = vi.fn<() => Promise<void>>().mockRejectedValue(new Error("private server detail"));
  const rootRoute = createRootRoute({ errorComponent: ServerErrorPage });
  const indexRoute = createRoute({
    component: () => <p>Page loaded</p>,
    getParentRoute: () => rootRoute,
    loader,
    path: "/",
  });

  return {
    router: createRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree: rootRoute.addChildren([indexRoute]),
    }),
  };
}
