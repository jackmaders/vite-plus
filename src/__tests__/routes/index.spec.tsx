import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { routeTree } from "@/routeTree.gen";

vi.mock(import("@tanstack/react-devtools"));

describe("home route content", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders its hero, feature cards, and quick start guide", async () => {
    expect.assertions(5);

    // Arrange
    const router = createRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, {});

    // Assert
    expect(screen.getByRole("heading", { name: "Start simple, ship quickly." })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Type-Safe Routing" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Server Functions" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Streaming by Default" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Tailwind Native" })).toBeDefined();
  });
});

describe("home route links", () => {
  afterEach(() => {
    cleanup();
  });

  it("links to the about page and router guide", async () => {
    expect.assertions(4);

    // Arrange
    const router = createRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, {});

    // Assert
    expect(screen.getByRole("link", { name: "About This Starter" }).getAttribute("href")).toBe(
      "/about",
    );
    expect(screen.getByRole("link", { name: "Router Guide" }).getAttribute("href")).toBe(
      "https://tanstack.com/router",
    );
    expect(screen.getByRole("link", { name: "Router Guide" }).getAttribute("target")).toBe(
      "_blank",
    );
    expect(screen.getByRole("link", { name: "Router Guide" }).getAttribute("rel")).toBe(
      "noopener noreferrer",
    );
  });
});
