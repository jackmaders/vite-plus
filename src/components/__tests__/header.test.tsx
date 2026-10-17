import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Header } from "@/components/header";
import { createTanStackRouterWrapper } from "@test/vitest/wrappers/tanstack-router-wrapper";

async function renderHeader(path: "/" | "/about" = "/") {
  const rootRoute = createRootRoute();
  const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path: "/" }),
    createRoute({ getParentRoute: () => rootRoute, path: "/about" }),
  ]);
  const { router, wrapper } = createTanStackRouterWrapper(
    createRouter({ history: createMemoryHistory({ initialEntries: [path] }), routeTree }),
  );
  await router.load();
  render(<Header />, { wrapper });
}

describe("header identity and documentation", () => {
  afterEach(cleanup);

  it("provides a branded home link within the header navigation", async () => {
    expect.assertions(2);

    // Act
    await renderHeader();
    const navigation = within(screen.getByRole("banner")).getByRole("navigation");
    const heading = within(navigation).getByRole("heading", { name: "TanStack Start" });

    // Assert
    expect(within(heading).getByRole("link", { name: "TanStack Start" }).getAttribute("href")).toBe(
      "/",
    );
    expect(heading.tagName).toBe("H2");
  });

  it("opens the documentation in a new tab", async () => {
    expect.assertions(3);

    // Act
    await renderHeader();
    const link = screen.getByRole("link", { name: "Docs" });

    // Assert
    expect(link.getAttribute("href")).toBe(
      "https://tanstack.com/start/latest/docs/framework/react/overview",
    );
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toMatch(/(?:^|\s)noreferrer(?:\s|$)/u);
  });
});

describe("header navigation", () => {
  afterEach(cleanup);

  it("links to both pages and highlights home on the home page", async () => {
    expect.assertions(5);

    // Act
    await renderHeader();
    const home = screen.getByRole("link", { name: "Home" });
    const about = screen.getByRole("link", { name: "About" });

    // Assert
    expect(home.getAttribute("href")).toBe("/");
    expect(about.getAttribute("href")).toBe("/about");
    expect(home.getAttribute("aria-current")).toBe("page");
    expect([...home.classList]).toContain("is-active");
    expect([...about.classList]).not.toContain("is-active");
  });

  it("highlights about instead of home on the about page", async () => {
    expect.assertions(4);

    // Act
    await renderHeader("/about");
    const home = screen.getByRole("link", { name: "Home" });
    const about = screen.getByRole("link", { name: "About" });

    // Assert
    expect(about.getAttribute("aria-current")).toBe("page");
    expect([...about.classList]).toContain("is-active");
    expect(home.getAttribute("aria-current")).toBeNull();
    expect([...home.classList]).not.toContain("is-active");
  });
});

describe("header social links", () => {
  afterEach(cleanup);

  it("provides an accessible external link to X", async () => {
    expect.assertions(3);

    // Act
    await renderHeader();
    const link = screen.getByRole("link", { name: "Follow TanStack on X" });

    // Assert
    expect(link.getAttribute("href")).toBe("https://x.com/tan_stack");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toMatch(/(?:^|\s)noreferrer(?:\s|$)/u);
  });

  it("provides an accessible external link to GitHub", async () => {
    expect.assertions(3);

    // Act
    await renderHeader();
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
    await renderHeader();
    const button = screen.getByRole("button", {
      name: "Theme mode: auto (system). Click to switch to light mode.",
    });

    // Act
    fireEvent.click(button);

    // Assert
    expect(button.textContent).toBe("Light");
    expect(button.getAttribute("aria-label")).toBe("Theme mode: light. Click to switch mode.");
    expect(document.documentElement.dataset["theme"]).toBe("light");
  });
});
