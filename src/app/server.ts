import { isNotFound, isRedirect } from "@tanstack/react-router";
import {
  createServerEntry,
  createStartHandler,
  handleStartError,
  setResponseHeader,
} from "@tanstack/react-start/server";

import { reportServerError } from "@/shared/errors/index.server";

import { renderDocument } from "./errors/render-document.server";

const handler = createStartHandler(async (context) => {
  // Router consumes loader errors before they can reach request middleware.
  for (const match of context.router.state.matches) {
    if (match.status === "error") {
      reportServerError(match.error);
    }
  }
  return await renderDocument(context);
});

// eslint-disable-next-line import/no-default-export
export default createServerEntry({
  fetch: async (request, options) => {
    try {
      return await handler(request, options);
    } catch (error) {
      if (isRedirect(error) || isNotFound(error) || error instanceof Response) {
        throw error;
      }
      const reported = reportServerError(error);
      setResponseHeader("X-Error-Reference", reported.referenceId);
      return handleStartError(reported);
    }
  },
});
