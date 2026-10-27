import { QueryClient } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Header } from "@/app/layouts/header";
import { signOut, useSession } from "@/shared/auth";
import { TEST_SESSION } from "@test/vitest/fixtures/session";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

vi.mock(import("@/shared/auth"));

function createHeaderRouteTree() {
  const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()();
  const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: "/" });
  const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/about" });
  const todosRoute = createRoute({ getParentRoute: () => rootRoute, path: "/todos" });
  return rootRoute.addChildren([homeRoute, aboutRoute, todosRoute]);
}

describe("header identity and navigation", () => {
  it("provides a branded home link and navigation links", () => {
    expect.assertions(3);

    // Arrange
    const { wrapper } = createTestingWrapper();

    // Act
    render(<Header />, { wrapper });
    const banner = screen.getByRole("banner");

    // Assert
    expect(within(banner).getByRole("link", { name: "App" }).getAttribute("href")).toBe("/");
    expect(within(banner).getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    expect(within(banner).getByRole("link", { name: "About" }).getAttribute("href")).toBe("/about");
  });

  it("shows sign in button when user is unauthenticated", () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(useSession).mockReturnValue({ data: null, isPending: false } as never);
    const { wrapper } = createTestingWrapper();

    // Act
    render(<Header />, { wrapper });

    // Assert
    expect(screen.getByRole("link", { name: "Sign In" }).getAttribute("href")).toBe("/");
  });

  it("shows todos link and sign out button when user is authenticated", () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(useSession).mockReturnValue({ data: TEST_SESSION, isPending: false } as never);
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/todos"] }),
      routeTree: createHeaderRouteTree(),
    });
    const { wrapper } = createTestingWrapper({ router });

    // Act
    render(<Header />, { wrapper });

    // Assert
    expect(screen.getByRole("link", { name: "Todos" }).getAttribute("href")).toBe("/todos");
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeDefined();
  });
});

describe("header theme control", () => {
  afterEach(() => {
    delete document.documentElement.dataset["theme"];
  });

  it("allows switching the theme from the header", async () => {
    expect.assertions(3);

    // Arrange
    const user = userEvent.setup();
    const { wrapper } = createTestingWrapper();
    render(<Header />, { wrapper });
    const button = screen.getByRole("button", {
      name: "Theme mode: auto (system). Click to switch to light mode.",
    });

    // Act
    await user.click(button);

    // Assert
    expect(button.textContent).toBe("Light");
    expect(button.getAttribute("aria-label")).toBe("Theme mode: light. Click to switch mode.");
    expect(document.documentElement.dataset["theme"]).toBe("light");
  });
});

describe("header auth actions", () => {
  it("signs out from the desktop header and returns home", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(useSession).mockReturnValue({ data: TEST_SESSION, isPending: false } as never);
    const user = userEvent.setup();
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/todos"] }),
      routeTree: createHeaderRouteTree(),
    });
    await router.load();
    const navigate = vi.spyOn(router, "navigate");
    const { wrapper } = createTestingWrapper({ router });
    render(<Header />, { wrapper });

    // Act
    await user.click(screen.getByRole("button", { name: "Sign Out" }));

    // Assert
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ to: "/" });
    });
    expect(signOut).toHaveBeenCalledWith();
  });

  it("shows sign in in the mobile drawer without a session", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(useSession).mockReturnValue({ data: null, isPending: false } as never);
    const user = userEvent.setup();
    const { wrapper } = createTestingWrapper();
    render(<Header />, { wrapper });

    // Act
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const drawer = await screen.findByRole("dialog");

    // Assert
    expect(within(drawer).getByRole("link", { name: "Sign In" }).getAttribute("href")).toBe("/");
    expect(within(drawer).queryByRole("link", { name: "Todos" })).toBeNull();
  });

  it("signs out from the mobile drawer and returns home", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(useSession).mockReturnValue({ data: TEST_SESSION, isPending: false } as never);
    const user = userEvent.setup();
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/todos"] }),
      routeTree: createHeaderRouteTree(),
    });
    await router.load();
    const navigate = vi.spyOn(router, "navigate");
    const { wrapper } = createTestingWrapper({ router });
    render(<Header />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const drawer = await screen.findByRole("dialog");
    const todos = within(drawer).getByRole("link", { name: "Todos" });

    // Act
    await user.click(within(drawer).getByRole("button", { name: "Sign Out" }));

    // Assert
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ to: "/" });
    });
    expect(todos.getAttribute("href")).toBe("/todos");
    expect(signOut).toHaveBeenCalledWith();
  });
});
