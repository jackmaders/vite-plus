import { CancelledError, MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import {
  createRouter as createTanStackRouter,
  isNotFound,
  isRedirect,
} from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { toast } from "@/shared/ui/shadcn/toast";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError: showServerFunctionToast,
    }),
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.dataUpdatedAt === 0 || query.meta?.["errorHandling"] === "inline") {
          return;
        }

        showServerFunctionToast(error);
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

function showServerFunctionToast(error: Error) {
  if (typeof window === "undefined" || isIgnoredError(error)) {
    return;
  }

  toast.add({ title: error.message, type: "error" });
}

function isIgnoredError(error: unknown): boolean {
  return error instanceof CancelledError || isNotFound(error) || isRedirect(error);
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
