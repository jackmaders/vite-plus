import { describe, expect, it, vi } from "vite-plus/test";

vi.mock(import("better-auth/react"));
vi.mock(import("@/shared/auth/session.functions"));

describe("shared/auth barrel exports", () => {
  it("does not re-export client authentication utilities from universal index.ts", async () => {
    expect.assertions(4);

    // Arrange
    const universalAuth = await import("@/shared/auth");

    // Assert
    expect(universalAuth.authClient).toBeUndefined();
    expect(universalAuth.signIn).toBeUndefined();
    expect(universalAuth.signOut).toBeUndefined();
    expect(universalAuth.signUp).toBeUndefined();
  });

  it("exports server functions and middleware from index.ts", async () => {
    expect.assertions(2);

    // Arrange
    const universalAuth = await import("@/shared/auth");

    // Assert
    expect(universalAuth.getSessionFn).toBeDefined();
    expect(universalAuth.authMiddleware).toBeDefined();
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
