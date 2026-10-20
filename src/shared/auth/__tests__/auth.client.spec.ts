import { describe, expect, it, vi } from "vite-plus/test";

import { authClient, signIn, signOut, signUp, useSession } from "@/shared/auth/auth.client";

vi.mock(import("better-auth/react"));

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
