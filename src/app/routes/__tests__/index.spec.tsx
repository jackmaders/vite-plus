import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route as HomeRoute } from "@/app/routes/index";
import { routeTree } from "@/app/routeTree.gen";
import { getSessionFn } from "@/shared/auth";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

vi.mock(import("@/shared/auth"));
vi.mock(import("@/pages/todos"));
vi.mock(import("@/app/styles/styles.css?url"), () => ({ default: "/styles.css" }));
vi.mock(import("@tanstack/react-devtools"));
vi.mock(import("@tanstack/react-router-devtools"));
vi.mock(import("@tanstack/react-query-devtools"));

function getBeforeLoad() {
  const { beforeLoad } = HomeRoute.options;
  if (!beforeLoad) {
    throw new TypeError("Expected beforeLoad to be defined");
  }
  return beforeLoad;
}

type BeforeLoadArgs = NonNullable<Parameters<ReturnType<typeof getBeforeLoad>>[0]>;

describe("home route beforeLoad guard", () => {
  it("redirects authenticated user to /todos", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValueOnce(TEST_SESSION);
    const beforeLoad = getBeforeLoad();
    const emptyArgs = {} as unknown as BeforeLoadArgs;

    // Act
    async function act() {
      await beforeLoad(emptyArgs);
    }

    // Assert
    await expect(act).rejects.toMatchObject({
      options: { to: "/todos" },
    });
  });

  it("does not redirect unauthenticated user", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValueOnce(null);
    const beforeLoad = getBeforeLoad();
    const emptyArgs = {} as unknown as BeforeLoadArgs;

    // Act & Assert
    await expect(beforeLoad(emptyArgs)).resolves.toBeUndefined();
  });
});

describe("home route content", () => {
  it("renders auth form card when unauthenticated", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValue(null);
    const router = createRouter({
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree,
    });
    await router.load();

    // Act
    render(<RouterProvider router={router} />, { container: document });

    // Assert
    expect(screen.getByRole("heading", { name: "Sign In" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();
  });
});
