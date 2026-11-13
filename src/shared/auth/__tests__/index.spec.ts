import { describe, expect, it, vi } from "vite-plus/test";

import {
  getSessionFn,
  hasPermission,
  permissionMiddleware,
  signIn,
  signOut,
  signUp,
  useAuth,
  useSession,
} from "../index";

vi.mock(
  import("../auth.client"),
  () =>
    ({
      authClient: {},
      signIn: vi.fn<() => void>(),
      signOut: vi.fn<() => void>(),
      signUp: vi.fn<() => void>(),
      useSession: vi.fn<() => void>(),
    }) as never,
);

vi.mock(
  import("../session.functions"),
  () =>
    ({
      getSessionFn: vi.fn<() => void>(),
    }) as never,
);

vi.mock(
  import("../middleware"),
  () =>
    ({
      permissionMiddleware: vi.fn<() => void>(),
    }) as never,
);

vi.mock(
  import("../permissions"),
  () =>
    ({
      hasPermission: vi.fn<() => boolean>(),
    }) as never,
);

vi.mock(
  import("../use-auth"),
  () =>
    ({
      useAuth: vi.fn<() => void>(),
    }) as never,
);

describe("shared/auth barrel exports", () => {
  it("exports universal client utilities from index.ts", () => {
    // Arrange
    expect.assertions(4);

    // Assert
    expect(signIn).toBeDefined();
    expect(signOut).toBeDefined();
    expect(signUp).toBeDefined();
    expect(useSession).toBeDefined();
  });

  it("exports auth hook from index.ts", () => {
    // Arrange
    expect.assertions(1);

    // Assert
    expect(useAuth).toBeDefined();
  });

  it("exports authorization helpers from index.ts", () => {
    // Arrange
    expect.assertions(1);

    // Assert
    expect(hasPermission).toBeDefined();
  });

  it("exports server functions from index.ts", () => {
    // Arrange
    expect.assertions(1);

    // Assert
    expect(getSessionFn).toBeDefined();
  });

  it("exports middleware from index.ts", () => {
    // Arrange
    expect.assertions(1);

    // Assert
    expect(permissionMiddleware).toBeDefined();
  });
});
