import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { toast } from "@/shared/ui/shadcn/toast";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.add({ title: error.message, type: "error" });
      },
    }),
    queryCache: new QueryCache({
      onError: (error) => {
        toast.add({ title: error.message, type: "error" });
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

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
