import { MutationCache, QueryCache, QueryClient, CancelledError } from "@tanstack/react-query";
import { isNotFound, isRedirect } from "@tanstack/react-router";

import { getErrorMessage } from "@/shared/errors";
import { toast } from "@/shared/ui/shadcn/toast";

interface ErrorHandlingMeta extends Record<string, unknown> {
  errorHandling?: "inline";
}

function createQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      // oxlint-disable-next-line max-params -- Query provides mutation metadata as the fourth argument.
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.errorHandling !== "inline") {
          notifyApiError(error);
        }
      },
    }),
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.dataUpdatedAt > 0 && query.meta?.errorHandling !== "inline") {
          notifyApiError(error);
        }
      },
    }),
  });
}

function notifyApiError(error: unknown) {
  if (
    typeof window === "undefined" ||
    isRedirect(error) ||
    isNotFound(error) ||
    error instanceof CancelledError
  ) {
    return;
  }

  toast.add({ title: getErrorMessage(error), type: "error" });
}

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: ErrorHandlingMeta;
    queryMeta: ErrorHandlingMeta;
  }
}

export { createQueryClient };
