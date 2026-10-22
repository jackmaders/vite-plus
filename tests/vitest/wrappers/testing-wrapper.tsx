import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRouter,
  RouterContextProvider,
  type AnyRouter,
} from "@tanstack/react-router";
import type { ComponentProps } from "react";

interface TestingWrapperOptions {
  queryClient?: QueryClient;
  router?: AnyRouter;
}

// Creates fresh defaults and reuses supplied instances.
// Updates the router's query client while preserving other router context fields.
function createTestingWrapper({
  queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  }),
  router = createRouter({
    context: { queryClient },
    routeTree: createRootRouteWithContext<{ queryClient: QueryClient }>()(),
  }),
}: TestingWrapperOptions = {}) {
  const routerContext = router.options.context as Record<string, unknown>;
  router.update({ context: { ...routerContext, queryClient } });

  function TestingWrapper(props: Omit<ComponentProps<typeof QueryClientProvider>, "client">) {
    return (
      <QueryClientProvider {...props} client={queryClient}>
        <RouterContextProvider router={router}>{props.children}</RouterContextProvider>
      </QueryClientProvider>
    );
  }

  return { queryClient, router, wrapper: TestingWrapper };
}

export { createTestingWrapper };
