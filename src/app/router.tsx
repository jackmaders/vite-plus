import { CancelledError, MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import {
  createRouter as createTanStackRouter,
  isNotFound,
  isRedirect,
} from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { getErrorMessage } from "@/shared/errors";
import { toast } from "@/shared/ui/shadcn/toast";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError: (error) => {
        if (typeof window === "undefined" || isIgnoredError(error)) {
          return;
        }

        toast.add({ title: getErrorMessage(error), type: "error" });
      },
    }),
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (
          typeof window === "undefined" ||
          isIgnoredError(error) ||
          query.state.dataUpdatedAt === 0 ||
          query.meta?.["errorHandling"] === "inline"
        ) {
          return;
        }

        toast.add({ title: getErrorMessage(error), type: "error" });
      },
    }),
  });

  const router = createTanStackRouter({
    context: { queryClient },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    routeTree,
    scrollRestoration: true,
  });

  setupRouterSsrQueryIntegration({
    queryClient,
    router,
  });

  return router;
}

function isIgnoredError(error: unknown): boolean {
  return error instanceof CancelledError || isNotFound(error) || isRedirect(error);
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
