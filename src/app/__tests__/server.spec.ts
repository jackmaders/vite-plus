import { notFound, redirect } from "@tanstack/react-router";
import type {
  defaultStreamHandler,
  RequestHandler,
  setResponseHeader,
} from "@tanstack/react-start/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { ApplicationError } from "@/shared/errors";

import entry from "../server";

type StreamContext = Parameters<typeof defaultStreamHandler>[0];

const mocks = vi.hoisted(() => ({
  fallback: vi.fn<(error: unknown) => Response>(),
  handler: vi.fn<RequestHandler<unknown>>(),
  header: vi.fn<typeof setResponseHeader>(),
  report: vi.fn<(error: unknown) => ApplicationError & { referenceId: string }>(),
  stream: vi.fn<typeof defaultStreamHandler>(),
  streamHandler: {
    current: async (_context: StreamContext) => await Promise.resolve(new Response()),
  },
}));

vi.mock(import("@tanstack/react-start/server"), () => ({
  createServerEntry: (serverEntry) => serverEntry,
  createStartHandler: (renderHandler) => {
    mocks.streamHandler.current = renderHandler as (context: StreamContext) => Promise<Response>;
    return mocks.handler;
  },
  handleStartError: mocks.fallback,
  setResponseHeader: mocks.header,
}));
vi.mock(import("../errors/render-document.server"), () => ({ renderDocument: mocks.stream }));
vi.mock(import("@/shared/errors/index.server"), () => ({ reportServerError: mocks.report }));

describe("server entry reporting", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("forwards successful requests", async () => {
    expect.hasAssertions();
    // Arrange
    const response = new Response("OK");
    mocks.handler.mockResolvedValueOnce(response);

    // Act
    const actual = await entry.fetch(new Request("http://localhost/"));

    // Assert
    expect(actual).toBe(response);
    expect(mocks.report).not.toHaveBeenCalled();
  });

  it("reports escaping errors and preserves the native fallback", async () => {
    expect.hasAssertions();
    // Arrange
    const error = new Error("Private initialization failure");
    const reported = Object.assign(new ApplicationError("UNEXPECTED", "Please try again"), {
      referenceId: "ref-1",
    });
    mocks.handler.mockRejectedValueOnce(error);
    mocks.report.mockReturnValueOnce(reported);
    mocks.fallback.mockReturnValueOnce(new Response("Internal Server Error", { status: 500 }));

    // Act
    const response = await entry.fetch(new Request("http://localhost/"));

    // Assert
    expect(response.status).toBe(500);
    expect(mocks.header).toHaveBeenCalledWith("X-Error-Reference", "ref-1");
    expect(mocks.fallback).toHaveBeenCalledWith(reported);
  });

  it.each([redirect({ to: "/" }), notFound(), new Response(null, { status: 404 })])(
    "preserves native control flow %#",
    async (control) => {
      expect.hasAssertions();
      // Arrange
      mocks.handler.mockRejectedValueOnce(control);

      // Act
      const response = entry.fetch(new Request("http://localhost/"));

      // Assert
      await expect(response).rejects.toBe(control);
    },
  );

  it("reports errors consumed by Router before rendering the document", async () => {
    expect.hasAssertions();
    // Arrange
    const error = new Error("Loader failed");
    const context = {
      router: { state: { matches: [{ status: "success" }, { error, status: "error" }] } },
    } as StreamContext;
    mocks.stream.mockResolvedValueOnce(new Response("Fallback page"));

    // Act
    const response = await mocks.streamHandler.current(context);

    // Assert
    expect(mocks.report).toHaveBeenCalledWith(error);
    await expect(response.text()).resolves.toBe("Fallback page");
  });
});
