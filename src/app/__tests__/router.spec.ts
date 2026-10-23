import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { getRouter } from "@/app/router";
import { DependencyError, ValidationError } from "@/shared/errors";

vi.mock(import("@tanstack/react-router-ssr-query"));

function getQueryRetry() {
  const retry = getRouter().options.context.queryClient.getDefaultOptions().queries?.retry;
  if (typeof retry !== "function") {
    throw new TypeError("Expected a query retry policy");
  }
  return retry;
}

describe("query retry policy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    { error: new Error("offline"), expected: false, failures: 0, server: true },
    {
      error: new ValidationError("INVALID", "Invalid input"),
      expected: false,
      failures: 0,
      server: false,
    },
    { error: new Error("offline"), expected: true, failures: 0, server: false },
    { error: new Error("offline"), expected: false, failures: 2, server: false },
    {
      error: new DependencyError("DB_FAILED", "Unavailable"),
      expected: true,
      failures: 0,
      server: false,
    },
    {
      error: new DependencyError("DB_FAILED", "Unavailable"),
      expected: false,
      failures: 2,
      server: false,
    },
  ])(
    "retries only reads that may recover: $server, $failures, $expected",
    ({ server, failures, error, expected }) => {
      expect.assertions(1);
      // Arrange
      vi.stubEnv("SSR", server);
      const retry = getQueryRetry();

      // Act
      const result = retry(failures, error);

      // Assert
      expect(result).toBe(expected);
    },
  );
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

describe("router auth route matching", () => {
  it("matches the profile page within authenticated layout", () => {
    expect.assertions(1);

    // Act
    const router = getRouter();
    const matches = router.matchRoutes("/profile");

    // Assert
    expect(matches.map((match) => match.routeId)).toStrictEqual([
      "__root__",
      "/_authenticated",
      "/_authenticated/profile",
    ]);
  });

  it("matches api auth splat routes within the root document", () => {
    expect.assertions(1);

    // Act
    const router = getRouter();
    const matches = router.matchRoutes("/api/auth/sign-in");

    // Assert
    expect(matches.map((match) => match.routeId)).toStrictEqual(["__root__", "/api/auth/$"]);
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
