import type { createAuthClient, useStore } from "better-auth/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { authClient, signIn, signOut, signUp, useSession } from "@/shared/auth/auth.client";

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

describe("auth.client", () => {
  it("exports auth client instance and authentication methods", () => {
    expect.assertions(5);

    // Assert
    expect(authClient).toBeDefined();
    expect(signIn).toBe(authClient.signIn);
    expect(signOut).toBe(authClient.signOut);
    expect(signUp).toBe(authClient.signUp);
    expect(useSession).toBe(authClient.useSession);
  });
});
