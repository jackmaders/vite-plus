import type {
  SsrResponse,
  transformReadableStreamWithRouter,
  waitForRequest,
} from "@tanstack/react-router/ssr/server";
import type { renderToReadableStream } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { UnexpectedError } from "@/shared/errors";

import { renderDocument } from "../render-document.server";

type RenderContext = Parameters<typeof renderDocument>[0];

const mocks = vi.hoisted(() => ({
  isbot: vi.fn<(agent?: string | null) => boolean>(),
  render: vi.fn<typeof renderToReadableStream>(),
  report: vi.fn<(error: unknown) => UnexpectedError & { referenceId: string }>(),
  transform: vi.fn<typeof transformReadableStreamWithRouter>(),
  wait: vi.fn<(ready: Promise<void>, signal: AbortSignal) => Promise<void>>(),
}));

vi.mock(import("react-dom/server"), () => ({ renderToReadableStream: mocks.render }));
vi.mock(import("isbot"), () => ({ isbot: mocks.isbot }));
vi.mock(import("@tanstack/react-start/server"), () => ({ StartServer: () => <div /> }));
vi.mock(import("@/shared/errors/index.server"), () => ({ reportServerError: mocks.report }));
vi.mock(import("@tanstack/react-router/ssr/server"), async (importOriginal) => ({
  ...(await importOriginal()),
  getSsrStatus: () => 200,
  transformReadableStreamWithRouter: mocks.transform,
  waitForRequest: mocks.wait as typeof waitForRequest,
}));

function createRenderContext() {
  const cleanup = vi.fn<() => void>();
  const context = {
    request: new Request("http://localhost/"),
    responseHeaders: new Headers({ "Content-Type": "text/html" }),
    router: { options: {}, serverSsr: { cleanup } },
  } as unknown as RenderContext;
  mocks.render.mockResolvedValue(
    Object.assign(new ReadableStream(), { allReady: Promise.resolve() }),
  );
  mocks.transform.mockReturnValue(
    new ReadableStream({
      start(controller) {
        controller.close();
      },
    }),
  );
  return { cleanup, context };
}

function getRenderOptions() {
  const options = mocks.render.mock.calls[0]?.[1];
  if (!options) {
    throw new TypeError("Expected React rendering options");
  }
  return options;
}

describe("workers streaming renderer", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("streams a document with Router's response helpers", async () => {
    expect.assertions(2);
    // Arrange
    const { context } = createRenderContext();

    // Act
    const view = (await renderDocument(context)) as SsrResponse;

    // Assert
    expect(view.response.headers.get("Content-Type")).toBe("text/html");
    expect(mocks.wait).not.toHaveBeenCalled();
  });

  it("reports recoverable React render errors with a reference digest", async () => {
    expect.assertions(2);
    // Arrange
    const { context } = createRenderContext();
    const error = new Error("render failed");
    mocks.report.mockReturnValue(
      Object.assign(new UnexpectedError("UNEXPECTED", "Please try again"), {
        referenceId: "ref-render",
      }),
    );

    // Act
    await renderDocument(context);
    const digest = getRenderOptions().onError?.(error, { componentStack: "" });

    // Assert
    expect(mocks.report).toHaveBeenCalledWith(error);
    expect(digest).toBe("ref-render");
  });

  it("does not report render errors caused by disconnecting", async () => {
    expect.assertions(1);
    // Arrange
    const { context } = createRenderContext();
    const controller = new AbortController();
    context.request = new Request("http://localhost/", { signal: controller.signal });

    // Act
    await renderDocument(context);
    controller.abort();
    getRenderOptions().onError?.(new Error("aborted"), { componentStack: "" });

    // Assert
    expect(mocks.report).not.toHaveBeenCalled();
  });

  it("waits for bots and links stream cancellation to the wait", async () => {
    expect.assertions(2);
    // Arrange
    const { context } = createRenderContext();
    context.router.options.ssr = { nonce: "nonce-1" };
    mocks.isbot.mockReturnValue(true);

    // Act
    await renderDocument(context);
    mocks.transform.mock.calls[0]?.[2]?.onAbort?.("Disconnected");

    // Assert
    expect(mocks.wait.mock.calls[0]?.[1].aborted).toBe(true);
    expect(getRenderOptions().nonce).toBe("nonce-1");
  });

  it("cleans up and propagates a fatal render failure", async () => {
    expect.assertions(2);
    // Arrange
    const { context, cleanup } = createRenderContext();
    const error = new Error("fatal render failure");
    mocks.render.mockRejectedValueOnce(error);

    // Act
    const view = renderDocument(context);

    // Assert
    await expect(view).rejects.toBe(error);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it("propagates aborted requests even if Router has already cleaned up", async () => {
    expect.assertions(1);
    // Arrange
    const { context } = createRenderContext();
    context.request = new Request("http://localhost/", {
      signal: AbortSignal.abort(new Error("Disconnected")),
    });
    delete context.router.serverSsr;

    // Act
    const view = renderDocument(context);

    // Assert
    await expect(view).rejects.toThrow("Disconnected");
  });
});
