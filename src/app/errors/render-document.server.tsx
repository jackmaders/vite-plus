import type { AnyRouter } from "@tanstack/react-router";
import {
  createSsrStreamResponse,
  defineHandlerCallback,
  getSsrStatus,
  transformReadableStreamWithRouter,
  waitForRequest,
} from "@tanstack/react-router/ssr/server";
import { StartServer } from "@tanstack/react-start/server";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

import { reportServerError } from "@/shared/errors/index.server";

// Workers use React's Web Streams renderer; Router owns hydration and stream cleanup.
const renderDocument = defineHandlerCallback(async ({ request, router, responseHeaders }) => {
  const { signal } = request;
  try {
    signal.throwIfAborted();
    const stream = await renderToReadableStream(<StartServer router={router} />, {
      nonce: router.options.ssr?.nonce,
      onError: (error) => {
        if (signal.aborted) {
          return "";
        }
        return reportServerError(error).referenceId;
      },
      signal,
    });
    const body = await prepareDocumentBody({ request, router, stream });
    return createSsrStreamResponse(
      router,
      new Response(body, { headers: responseHeaders, status: getSsrStatus(router) }),
    );
  } catch (error) {
    router.serverSsr?.cleanup();
    throw error;
  }
});

async function prepareDocumentBody({
  request,
  router,
  stream,
}: {
  request: Request;
  router: AnyRouter;
  stream: Awaited<ReturnType<typeof renderToReadableStream>>;
}) {
  const botAbort = new AbortController();
  const body = transformReadableStreamWithRouter(router, stream, {
    onAbort: (reason) => {
      botAbort.abort(reason);
    },
    rendererSafePoint: "script-close",
    signal: request.signal,
  });
  if (isbot(request.headers.get("User-Agent"))) {
    await waitForRequest(stream.allReady, botAbort.signal);
  }
  return body;
}

export { renderDocument };
