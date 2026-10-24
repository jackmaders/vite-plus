import { type RequestHandler, setResponseHeader } from "@tanstack/react-start/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { reportServerError } from "@/shared/errors/index.server";

import entry from "../server";

const { handler } = vi.hoisted(() => ({ handler: vi.fn<RequestHandler<unknown>>() }));

vi.mock(import("@tanstack/react-start/server"), async (importOriginal) => ({
  ...(await importOriginal()),
  createStartHandler: () => handler,
}));

describe("native Start server entry context", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports outside a native request without retaining a deduplication scope", () => {
    expect.assertions(2);
    // Arrange
    const log = vi.spyOn(console, "error").mockImplementation(() => {
      /* Expected reporting. */
    });
    const error = new Error("Background failure");

    // Act
    const first = reportServerError(error);
    const second = reportServerError(error);

    // Assert
    expect(first.referenceId).not.toBe(second.referenceId);
    expect(log).toHaveBeenCalledTimes(2);
  });

  it("retains request scope in the error catch after an asynchronous rejection", async () => {
    expect.assertions(4);
    // Arrange
    vi.spyOn(console, "error").mockImplementation(() => {
      /* Expected reporting. */
    });
    handler.mockImplementationOnce(async () => {
      setResponseHeader("X-Test-Context", "retained");
      await Promise.resolve();
      throw new Error("Private initialization failure");
    });

    // Act
    const response = await entry.fetch(new Request("http://localhost/context-failure"));
    const body = await response.text();

    // Assert
    expect(response.status).toBe(500);
    expect(response.headers.get("X-Test-Context")).toBe("retained");
    expect(response.headers.get("X-Error-Reference")).toMatch(/^[\da-f-]{36}$/u);
    expect(body).not.toContain("Private initialization failure");
  });
});
