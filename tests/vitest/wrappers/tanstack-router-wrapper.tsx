import { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRouter,
  RouterContextProvider,
  type AnyRouter,
} from "@tanstack/react-router";
import type { ComponentProps } from "react";

function createTanStackRouterWrapper(
  router: AnyRouter = createRouter({
    context: { queryClient: new QueryClient() },
    routeTree: createRootRouteWithContext<{ queryClient: QueryClient }>()(),
  }),
) {
  function RouterWrapper(props: Omit<ComponentProps<typeof RouterContextProvider>, "router">) {
    return <RouterContextProvider {...props} router={router} />;
  }

  return { router, wrapper: RouterWrapper };
}

export { createTanStackRouterWrapper };
