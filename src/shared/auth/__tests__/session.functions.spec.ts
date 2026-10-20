import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { getSession } from "@/shared/auth/session.server";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

vi.mock(import("@tanstack/react-start"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    createServerFn: vi.fn<() => { handler: (fn: (...args: unknown[]) => unknown) => unknown }>(
      () => ({
        handler: (fn: (...args: unknown[]) => unknown) => fn,
      }),
    ) as unknown as typeof actual.createServerFn,
  };
});

vi.mock(import("@/shared/auth/session.server"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    getSession: vi.fn<() => void>() as unknown as typeof actual.getSession,
  };
});

describe("session.functions getSessionFn", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the session from getSession when authenticated", async () => {
    expect.assertions(1);

    // Arrange
    const { getSessionFn } = await import("@/shared/auth/session.functions");
    vi.mocked(getSession).mockResolvedValueOnce(TEST_SESSION);

    // Act
    const session = await getSessionFn();

    // Assert
    expect(session).toStrictEqual(TEST_SESSION);
  });

  it("returns null when getSession returns null", async () => {
    expect.assertions(1);

    // Arrange
    const { getSessionFn } = await import("@/shared/auth/session.functions");
    // oxlint-disable-next-line unicorn/no-null
    vi.mocked(getSession).mockResolvedValueOnce(null);

    // Act
    const session = await getSessionFn();

    // Assert
    expect(session).toBeNull();
  });
});
