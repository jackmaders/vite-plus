import { QueryClient } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { Footer } from "@/app/layouts/footer";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

function createFooterRouteTree() {
  const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()();
  const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: "/" });
  const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/about" });
  return rootRoute.addChildren([homeRoute, aboutRoute]);
}

describe("footer navigation", () => {
  it("provides navigation links to home and about", () => {
    expect.assertions(2);

    // Arrange
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree: createFooterRouteTree(),
    });
    const { wrapper } = createTestingWrapper({ router });

    // Act
    render(<Footer />, { wrapper });
    const footer = within(screen.getByRole("contentinfo"));

    // Assert
    expect(footer.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    expect(footer.getByRole("link", { name: "About" }).getAttribute("href")).toBe("/about");
  });
});
