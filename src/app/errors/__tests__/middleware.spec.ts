import { notFound, redirect } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";

import { functionErrorMiddleware, requestErrorMiddleware } from "../middleware";

const { requestContext } = vi.hoisted(() => ({
  requestContext: { current: new Request("http://localhost/test") },
}));

vi.mock(import("@tanstack/react-start/server"), () => ({
  getRequest: () => requestContext.current,
}));

describe("native error middleware", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rethrows a reported Error instead of resolving a failure as data", async () => {
    expect.hasAssertions();

    // Arrange
    vi.spyOn(console, "warn").mockImplementation(() => {
      /* Expected reporting. */
    });
    const error = new ApplicationError("TODO_NOT_FOUND", "Todo not found", { status: 404 });
    const next = vi.fn<() => Promise<never>>().mockRejectedValue(error);

    // Act
    const result = functionErrorMiddleware.options.server?.({ next } as never);

    // Assert
    await expect(result).rejects.toMatchObject({
      code: "TODO_NOT_FOUND",
      name: "ApplicationError",
      referenceId: expect.any(String) as unknown,
    });
  });

  it("turns an unknown request failure into a safe unexpected Error", async () => {
    expect.hasAssertions();

    // Arrange
    vi.spyOn(console, "error").mockImplementation(() => {
      /* Expected reporting. */
    });
    const next = vi.fn<() => Promise<never>>().mockRejectedValue("private failure");

    // Act
    const result = requestErrorMiddleware.options.server?.({ next } as never);

    // Assert
    await expect(result).rejects.toBeInstanceOf(ApplicationError);
  });

  it.each([redirect({ to: "/" }), notFound(), new Response(null, { status: 403 })])(
    "preserves Router and HTTP control flow %#",
    async (control) => {
      expect.hasAssertions();

      // Arrange
      const next = vi.fn<() => Promise<never>>().mockRejectedValue(control);

      // Act
      const result = functionErrorMiddleware.options.server?.({ next } as never);

      // Assert
      await expect(result).rejects.toBe(control);
    },
  );

  it("passes through successful requests", async () => {
    expect.assertions(1);
    // Arrange
    const next = vi.fn<() => Promise<unknown>>().mockResolvedValue({ result: "OK" });

    // Act
    const result = await requestErrorMiddleware.options.server?.({ next } as never);

    // Assert
    expect(result).toMatchObject({ result: "OK" });
  });

  it.each([redirect({ to: "/" }), notFound(), new Response(null, { status: 403 })])(
    "preserves request control flow %#",
    async (control) => {
      expect.assertions(1);
      // Arrange
      const next = vi.fn<() => Promise<never>>().mockRejectedValue(control);

      // Act
      const result = requestErrorMiddleware.options.server?.({ next } as never);

      // Assert
      await expect(result).rejects.toBe(control);
    },
  );
});
