import { QueryClient } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { routeTree } from "@/app/routeTree.gen";

import { RouteError } from "../-route-error";

vi.mock(import("@/app/styles/styles.css?url"), () => ({ default: "/styles.css" }));

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
    render(<RouterProvider router={router} />, { container: document });

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
    render(<RouterProvider router={router} />, { container: document });

    // Assert
    expect(screen.getByText("Router Devtools Panel")).toBeDefined();
    expect(screen.getByText("React Query Devtools Panel")).toBeDefined();
  });
});

describe("root route notFoundComponent", () => {
  afterEach(() => {
    cleanup();
  });

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

describe("route error recovery", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows a safe error and retries the failed loader", async () => {
    expect.assertions(4);

    // Arrange
    const user = userEvent.setup();
    const { loader, router } = createRetryRouter();
    const { privateDetailVisible, safeMessageVisible } = await renderFailedRoute(router);

    // Act
    await user.click(screen.getByRole("button", { name: "Try again" }));

    // Assert
    expect(safeMessageVisible).toBe(true);
    expect(privateDetailVisible).toBe(false);
    await expect(screen.findByText("Page loaded")).resolves.toBeDefined();
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("resets the route boundary when retry invalidation rejects", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    const { router } = createRetryRouter();
    await renderFailedRoute(router);
    vi.spyOn(router, "invalidate").mockRejectedValue(new Error("invalidation failed"));

    // Act
    await user.click(screen.getByRole("button", { name: "Try again" }));
    await Promise.resolve();

    // Assert
    expect(router.invalidate).toHaveBeenCalledOnce();
  });
});

function createRetryRouter() {
  const loader = vi
    .fn<() => Promise<void>>()
    .mockRejectedValueOnce(new Error("private server detail"))
    .mockResolvedValueOnce();
  const rootRoute = createRootRoute({ errorComponent: RouteError });
  const indexRoute = createRoute({
    component: () => <p>Page loaded</p>,
    getParentRoute: () => rootRoute,
    loader,
    path: "/",
  });

  return {
    loader,
    router: createRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree: rootRoute.addChildren([indexRoute]),
    }),
  };
}

async function renderFailedRoute(router: ReturnType<typeof createRetryRouter>["router"]) {
  await router.load();
  render(<RouterProvider router={router} />);

  return {
    privateDetailVisible: screen.queryByText("private server detail") !== null,
    safeMessageVisible: screen.queryByText("Something went wrong. Please try again.") !== null,
  };
}
