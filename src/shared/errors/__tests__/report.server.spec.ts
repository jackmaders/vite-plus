import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { z } from "zod";

import { NotFoundError, UnexpectedError, ValidationError } from "../index";
import { reportServerError } from "../report.server";

const { requestContext } = vi.hoisted(() => ({
  requestContext: { current: new Request("http://localhost/test") },
}));

vi.mock(import("@tanstack/react-start/server"), () => ({
  getRequest: () => requestContext.current,
}));

describe("server error reporting", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports once when the same error crosses multiple lifecycle hooks", () => {
    expect.hasAssertions();

    // Arrange
    const log = vi.spyOn(console, "warn").mockImplementation(() => {
      /* Expected reporting is asserted below. */
    });
    const error = new NotFoundError("TODO_NOT_FOUND", "Todo not found");

    // Act
    const first = reportServerError(error);
    const second = reportServerError(error);
    const third = reportServerError(first);

    // Assert
    expect(first).toBeInstanceOf(NotFoundError);
    expect(second).toBe(first);
    expect(third).toBe(first);
    expect(log).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        code: "TODO_NOT_FOUND",
        event: "application_error",
        referenceId: first.referenceId,
      }),
    );
  });

  it("replaces unknown failures without leaking messages to logs or clients", () => {
    expect.hasAssertions();

    // Arrange
    const log = vi.spyOn(console, "error").mockImplementation(() => {
      /* Expected reporting is asserted below. */
    });
    const cause = new Error("Failed query: SELECT secret; params: private-value");

    // Act
    const reported = reportServerError(cause);

    // Assert
    expect(reported).toBeInstanceOf(UnexpectedError);
    expect(reported.referenceId).toBeTypeOf("string");
    expect(reported.message).not.toContain("private-value");
    expect(JSON.stringify(log.mock.calls)).not.toContain("private-value");
  });

  it("classifies native Zod failures without exposing input", () => {
    expect.hasAssertions();

    // Arrange
    vi.spyOn(console, "warn").mockImplementation(() => {
      /* Expected reporting is asserted below. */
    });
    const parsed = z.string().min(2).safeParse("");

    // Act
    const reported = reportServerError(parsed.error);

    // Assert
    expect(reported).toBeInstanceOf(ValidationError);
    expect(reported.code).toBe("INVALID_INPUT");
  });

  it("reports a reused Error separately in the next request", () => {
    expect.assertions(2);
    // Arrange
    const log = vi.spyOn(console, "warn").mockImplementation(() => {
      /* Expected reporting. */
    });
    const error = new NotFoundError("MISSING", "Record not found");

    // Act
    const first = reportServerError(error);
    requestContext.current = new Request("http://localhost/next-request");
    const second = reportServerError(error);

    // Assert
    expect(second.referenceId).not.toBe(first.referenceId);
    expect(log).toHaveBeenCalledTimes(2);
  });
});
