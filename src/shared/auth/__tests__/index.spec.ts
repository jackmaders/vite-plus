import { describe, expect, it, vi } from "vite-plus/test";

vi.mock(import("better-auth/react"));
vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/auth/session.functions"));

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
