import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { getRouter } from "@/app/router";

vi.mock(import("@tanstack/react-router-ssr-query"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    setupRouterSsrQueryIntegration: vi.fn<typeof actual.setupRouterSsrQueryIntegration>(
      actual.setupRouterSsrQueryIntegration,
    ),
  };
});

describe("router route matching", () => {
  it("matches the home page within the root document", () => {
    expect.assertions(1);

    // Act
    const router = getRouter();
    const matches = router.matchRoutes("/");

    // Assert
    expect(matches.map((match) => match.routeId)).toStrictEqual(["__root__", "/"]);
  });

  it("matches the about page within the root document", () => {
    expect.assertions(1);

    // Act
    const router = getRouter();
    const matches = router.matchRoutes("/about");

    // Assert
    expect(matches.map((match) => match.routeId)).toStrictEqual(["__root__", "/about"]);
  });

  it("does not match a page for unknown paths", () => {
    expect.assertions(1);

    // Act
    const router = getRouter();
    const matches = router.matchRoutes("/missing");

    // Assert
    expect(matches.map((match) => match.routeId)).toStrictEqual(["__root__"]);
  });
});

describe("router instance isolation", () => {
  it("creates independent routers so changing one does not affect another", () => {
    expect.assertions(3);

    // Arrange
    const first = getRouter();
    const second = getRouter();

    // Act
    first.update({
      context: first.options.context,
      defaultPreload: "render",
    });

    // Assert
    expect(first).not.toBe(second);
    expect(first.options.defaultPreload).toBe("render");
    expect(second.options.defaultPreload).toBe("intent");
  });
});

describe("router query integration", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("exposes queryClient on the router context", () => {
    expect.assertions(1);

    // Act
    const router = getRouter();
    const { queryClient } = router.options.context;

    // Assert
    expect(queryClient).toBeInstanceOf(QueryClient);
  });

  it("isolates queryClient instances across router calls", () => {
    expect.assertions(1);

    // Arrange
    const first = getRouter();
    const second = getRouter();

    // Act
    const { queryClient: firstClient } = first.options.context;
    const { queryClient: secondClient } = second.options.context;

    // Assert
    expect(firstClient).not.toBe(secondClient);
  });

  it("executes setupRouterSsrQueryIntegration with queryClient and router", () => {
    expect.assertions(1);

    // Act
    const router = getRouter();

    // Assert
    expect(setupRouterSsrQueryIntegration).toHaveBeenCalledWith({
      queryClient: router.options.context.queryClient,
      router,
    });
  });
});
