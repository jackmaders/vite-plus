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
      onError: showServerErrorToast,
    }),
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.dataUpdatedAt === 0) {
          return;
        }

        showServerErrorToast(error);
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

function showServerErrorToast(error: Error) {
  if (
    typeof window === "undefined" ||
    error instanceof CancelledError ||
    isNotFound(error) ||
    isRedirect(error)
  ) {
    return;
  }

  toast.add({ title: error.message, type: "error" });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
