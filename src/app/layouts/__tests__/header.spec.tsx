import { QueryClient } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Header } from "@/app/layouts/header";
import { createTanStackRouterWrapper } from "@test/vitest/wrappers/tanstack-router-wrapper";

function createAboutPageRouteTree() {
  const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()();
  const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: "/" });
  const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/about" });
  return rootRoute.addChildren([homeRoute, aboutRoute]);
}

describe("header identity and documentation", () => {
  afterEach(cleanup);

  it("provides a branded home link within the header navigation", () => {
    expect.assertions(2);

    // Arrange
    const { wrapper } = createTanStackRouterWrapper();

    // Act
    render(<Header />, { wrapper });
    const navigation = within(screen.getByRole("banner")).getByRole("navigation");
    const heading = within(navigation).getByRole("heading", { name: "TanStack Start" });

    // Assert
    expect(within(heading).getByRole("link", { name: "TanStack Start" }).getAttribute("href")).toBe(
      "/",
    );
    expect(heading.tagName).toBe("H2");
  });

  it("opens the documentation in a new tab", () => {
    expect.assertions(3);

    // Arrange
    const { wrapper } = createTanStackRouterWrapper();

    // Act
    render(<Header />, { wrapper });
    const link = screen.getByRole("link", { name: "Docs" });

    // Assert
    expect(link.getAttribute("href")).toBe(
      "https://tanstack.com/start/latest/docs/framework/react/overview",
    );
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toMatch(/(?:^|\s)noreferrer(?:\s|$)/u);
  });
});

describe("header page links", () => {
  afterEach(cleanup);

  it("provides links to all pages in the navigation", () => {
    expect.assertions(3);

    // Arrange
    const { wrapper } = createTanStackRouterWrapper();

    // Act
    render(<Header />, { wrapper });

    // Assert
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "About" }).getAttribute("href")).toBe("/about");
    expect(screen.getByRole("link", { name: "Todos" }).getAttribute("href")).toBe("/todos");
  });
});

describe("header active state", () => {
  afterEach(cleanup);

  it("highlights home on the home page", () => {
    expect.assertions(3);

    // Arrange
    const { wrapper } = createTanStackRouterWrapper();

    // Act
    render(<Header />, { wrapper });
    const home = screen.getByRole("link", { name: "Home" });
    const about = screen.getByRole("link", { name: "About" });

    // Assert
    expect(home.getAttribute("aria-current")).toBe("page");
    expect([...home.classList]).toContain("after:scale-x-100");
    expect([...about.classList]).not.toContain("after:scale-x-100");
  });

  it("highlights about instead of home on the about page", () => {
    expect.assertions(4);

    // Arrange
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/about"] }),
      routeTree: createAboutPageRouteTree(),
    });
    const { wrapper } = createTanStackRouterWrapper(router);

    // Act
    render(<Header />, { wrapper });
    const home = screen.getByRole("link", { name: "Home" });
    const about = screen.getByRole("link", { name: "About" });

    // Assert
    expect(about.getAttribute("aria-current")).toBe("page");
    expect([...about.classList]).toContain("after:scale-x-100");
    expect(home.getAttribute("aria-current")).toBeNull();
    expect([...home.classList]).not.toContain("after:scale-x-100");
  });
});

describe("header social links", () => {
  afterEach(cleanup);

  it("provides an accessible external link to X", () => {
    expect.assertions(3);

    // Arrange
    const { wrapper } = createTanStackRouterWrapper();

    // Act
    render(<Header />, { wrapper });
    const link = screen.getByRole("link", { name: "Follow TanStack on X" });

    // Assert
    expect(link.getAttribute("href")).toBe("https://x.com/tan_stack");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toMatch(/(?:^|\s)noreferrer(?:\s|$)/u);
  });

  it("provides an accessible external link to GitHub", () => {
    expect.assertions(3);

    // Arrange
    const { wrapper } = createTanStackRouterWrapper();

    // Act
    render(<Header />, { wrapper });
    const link = screen.getByRole("link", { name: "Go to TanStack GitHub" });

    // Assert
    expect(link.getAttribute("href")).toBe("https://github.com/TanStack");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toMatch(/(?:^|\s)noreferrer(?:\s|$)/u);
  });
});

describe("header theme control", () => {
  afterEach(() => {
    cleanup();
    delete document.documentElement.dataset["theme"];
  });

  it("allows switching the theme from the header", async () => {
    expect.assertions(3);

    // Arrange
    const user = userEvent.setup();
    const { wrapper } = createTanStackRouterWrapper();
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
