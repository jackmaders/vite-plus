import { getRequest } from "@tanstack/react-start/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { z } from "zod";

import { ApplicationError } from "../index";
import { reportServerError } from "../report.server";

const { requestContext } = vi.hoisted(() => ({
  requestContext: { current: new Request("http://localhost/test") },
}));

vi.mock(import("@tanstack/react-start/server"), () => ({
  getRequest: vi.fn<() => Request>(() => requestContext.current),
}));

describe("server error reporting", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports a failure even when no Start request is active", () => {
    expect.assertions(3);
    // Arrange
    const log = vi.spyOn(console, "error").mockImplementation(() => {
      /* Expected reporting. */
    });
    vi.mocked(getRequest).mockImplementationOnce(() => {
      throw new Error("No StartEvent found");
    });

    // Act
    const reported = reportServerError(new Error("Background task failed"));

    // Assert
    expect(reported).toBeInstanceOf(ApplicationError);
    expect(reported.referenceId).toBeTypeOf("string");
    expect(log).toHaveBeenCalledOnce();
  });

  it("reports once when the same error crosses multiple lifecycle hooks", () => {
    expect.hasAssertions();

    // Arrange
    const log = vi.spyOn(console, "warn").mockImplementation(() => {
      /* Expected reporting is asserted below. */
    });
    const error = new ApplicationError("TODO_NOT_FOUND", "Todo not found", { status: 404 });

    // Act
    const first = reportServerError(error);
    const second = reportServerError(error);
    const third = reportServerError(first);

    // Assert
    expect(first).toBeInstanceOf(ApplicationError);
    expect(second).toBe(first);
    expect(third).toBe(first);
    expect(log).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        code: "TODO_NOT_FOUND",
        event: "application_error",
        referenceId: first.referenceId,
        status: 404,
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
    expect(reported).toBeInstanceOf(ApplicationError);
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
    expect(reported).toBeInstanceOf(ApplicationError);
    expect(reported).toMatchObject({ code: "INVALID_INPUT", status: 400 });
  });

  it("reports a reused Error separately in the next request", () => {
    expect.assertions(2);
    // Arrange
    const log = vi.spyOn(console, "warn").mockImplementation(() => {
      /* Expected reporting. */
    });
    const error = new ApplicationError("MISSING", "Record not found", { status: 404 });

    // Act
    const first = reportServerError(error);
    requestContext.current = new Request("http://localhost/next-request");
    const second = reportServerError(error);

    // Assert
    expect(second.referenceId).not.toBe(first.referenceId);
    expect(log).toHaveBeenCalledTimes(2);
  });
});
