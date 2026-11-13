import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route as AuthenticatedRoute } from "@/app/routes/_authenticated";
import { routeTree } from "@/app/routeTree.gen";
import { getSessionFn } from "@/shared/auth";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

vi.mock(import("@/shared/auth"));
vi.mock(import("@/pages/profile"));
vi.mock(import("@/app/styles/index.css?url"), () => ({ default: "/index.css" }));

vi.mock(import("@tanstack/react-devtools"));
vi.mock(import("@tanstack/react-router-devtools"));
vi.mock(import("@tanstack/react-query-devtools"));

function getBeforeLoad() {
  const { beforeLoad } = AuthenticatedRoute.options;
  if (!beforeLoad) {
    throw new TypeError("Expected beforeLoad to be defined");
  }
  return beforeLoad;
}

type BeforeLoadArgs = NonNullable<Parameters<ReturnType<typeof getBeforeLoad>>[0]>;

describe("_authenticated route beforeLoad guard", () => {
  it("returns session context when user is authenticated", () => {
    expect.assertions(1);

    // Arrange
    const beforeLoad = getBeforeLoad();
    const args = { context: { session: TEST_SESSION } } as unknown as BeforeLoadArgs;

    // Act
    const context: unknown = beforeLoad(args);

    // Assert
    expect(context).toStrictEqual({ session: TEST_SESSION });
  });

  it("throws a redirect to root when user is unauthenticated", () => {
    expect.assertions(1);

    // Arrange
    const beforeLoad = getBeforeLoad();
    const args = { context: { session: null } } as unknown as BeforeLoadArgs;

    // Act
    function act() {
      beforeLoad(args);
    }

    // Assert
    expect(act).toThrow(
      expect.objectContaining({
        options: expect.objectContaining({ to: "/" }) as unknown,
      }),
    );
  });
});

describe("_authenticated route layout and navigation", () => {
  it("redirects unauthenticated users attempting to access /profile to /", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValue(null);
    const router = createRouter({
      context: { queryClient: new QueryClient(), session: null },
      history: createMemoryHistory({ initialEntries: ["/profile"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, { container: document });

    // Assert
    expect(router.state.location.pathname).toBe("/");
  });

  it("renders profile route inside layout when user is authenticated", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValue(TEST_SESSION);
    const router = createRouter({
      context: { queryClient: new QueryClient(), session: null },
      history: createMemoryHistory({ initialEntries: ["/profile"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, { container: document });

    // Assert
    expect(screen.getByText("Mocked Profile Page")).toBeDefined();
  });
});
