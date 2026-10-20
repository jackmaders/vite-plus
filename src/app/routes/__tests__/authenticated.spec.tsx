import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Route as AuthenticatedRoute } from "@/app/routes/_authenticated";
import { routeTree } from "@/app/routeTree.gen";
import { getSessionFn } from "@/shared/auth";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

vi.mock(import("@/shared/auth"));
vi.mock(import("@/pages/profile"));
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
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns session context when user is authenticated", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValueOnce(TEST_SESSION);
    const beforeLoad = getBeforeLoad();
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const emptyArgs = {} as unknown as BeforeLoadArgs;

    // Act
    const context: unknown = await beforeLoad(emptyArgs);

    // Assert
    expect(context).toStrictEqual({ session: TEST_SESSION });
  });

  it("throws a redirect to root when user is unauthenticated", async () => {
    expect.assertions(1);

    // Arrange
    // oxlint-disable-next-line unicorn/no-null
    vi.mocked(getSessionFn).mockResolvedValueOnce(null);
    const beforeLoad = getBeforeLoad();
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const emptyArgs = {} as unknown as BeforeLoadArgs;

    // Act
    async function act() {
      await beforeLoad(emptyArgs);
    }

    // Assert
    await expect(act).rejects.toMatchObject({
      options: { to: "/" },
    });
  });
});

describe("_authenticated route layout and navigation", () => {
  afterEach(cleanup);

  it("redirects unauthenticated users attempting to access /profile to /", async () => {
    expect.assertions(1);

    // Arrange
    // oxlint-disable-next-line unicorn/no-null
    vi.mocked(getSessionFn).mockResolvedValueOnce(null);
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/profile"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />);

    // Assert
    expect(router.state.location.pathname).toBe("/");
  });

  it("renders profile route inside layout when user is authenticated", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValue(TEST_SESSION);
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/profile"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />);

    // Assert
    expect(screen.getByText("Mocked Profile Page")).toBeDefined();
  });
});
