import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { authMiddleware } from "@/shared/auth/middleware";
import { ensureSession } from "@/shared/auth/session.server";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

vi.mock(import("@/shared/auth/session.server"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    ensureSession: vi.fn<() => void>() as unknown as typeof actual.ensureSession,
  };
});

function getServerMiddleware() {
  const serverFn = authMiddleware.options.server;
  if (!serverFn) {
    throw new TypeError("Expected server middleware to be defined");
  }
  return serverFn;
}

type MiddlewareInput = Parameters<ReturnType<typeof getServerMiddleware>>[0];

describe("authMiddleware behavior", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("passes authenticated session to next context", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(ensureSession).mockResolvedValueOnce(TEST_SESSION);
    const next = vi.fn<() => Promise<{ status: string }>>().mockResolvedValueOnce({
      status: "success",
    });
    const serverFn = getServerMiddleware();
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const input = { context: {}, next } as unknown as MiddlewareInput;

    // Act
    const result = await serverFn(input);

    // Assert
    expect(next).toHaveBeenCalledWith({ context: { session: TEST_SESSION } });
    expect(result).toStrictEqual({ status: "success" });
  });

  it("propagates error when ensureSession fails", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new Error("Unauthorized"));
    const next = vi.fn<() => Promise<void>>();
    const serverFn = getServerMiddleware();
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const input = { context: {}, next } as unknown as MiddlewareInput;

    // Act & Assert
    await expect(serverFn(input)).rejects.toThrow("Unauthorized");
    expect(next).not.toHaveBeenCalled();
  });
});
