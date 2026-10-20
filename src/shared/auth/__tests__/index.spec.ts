import type { createAuthClient, useStore } from "better-auth/react";
import { describe, expect, it, vi } from "vite-plus/test";

vi.mock(import("better-auth/react"), () => {
  const mockClient = {
    signIn: vi.fn<() => void>(),
    signOut: vi.fn<() => void>(),
    signUp: vi.fn<() => void>(),
    useSession: vi.fn<() => void>(),
  };

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return {
    createAuthClient: vi.fn<() => typeof mockClient>(() => mockClient),
    useStore: vi.fn<() => void>(),
  } as unknown as { createAuthClient: typeof createAuthClient; useStore: typeof useStore };
});

vi.mock(import("@/shared/auth/session.functions"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    getSessionFn: vi.fn<() => void>() as unknown as typeof actual.getSessionFn,
  };
});

describe("shared/auth barrel exports", () => {
  it("exports universal client utilities from index.ts", async () => {
    expect.assertions(5);

    // Arrange
    const universalAuth = await import("@/shared/auth");

    // Assert
    expect(universalAuth.authClient).toBeDefined();
    expect(universalAuth.signIn).toBeDefined();
    expect(universalAuth.signOut).toBeDefined();
    expect(universalAuth.signUp).toBeDefined();
    expect(universalAuth.useSession).toBeDefined();
  });

  it("exports server functions from index.ts", async () => {
    expect.assertions(1);

    // Arrange
    const universalAuth = await import("@/shared/auth");

    // Assert
    expect(universalAuth.getSessionFn).toBeDefined();
  });

  it("exports client authentication utilities from index.client", async () => {
    expect.assertions(5);

    // Arrange
    const clientAuth = await import("@/shared/auth/index.client");

    // Assert
    expect(clientAuth.authClient).toBeDefined();
    expect(clientAuth.signIn).toBeDefined();
    expect(clientAuth.signOut).toBeDefined();
    expect(clientAuth.signUp).toBeDefined();
    expect(clientAuth.useSession).toBeDefined();
  });
});
