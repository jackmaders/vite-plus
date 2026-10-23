import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { AppError, DependencyError } from "@/shared/errors";

import { RouteError } from "./errors/route-error";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: retryQuery },
    },
  });

  const router = createTanStackRouter({
    context: { queryClient },
    defaultErrorComponent: RouteError,
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

function retryQuery(failureCount: number, error: Error) {
  const MAX_READ_RETRIES = 2;
  if (import.meta.env.SSR) {
    return false;
  }
  if (error instanceof AppError && !(error instanceof DependencyError)) {
    return false;
  }
  return failureCount < MAX_READ_RETRIES;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
