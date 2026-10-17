import {
  createRootRoute,
  createRouter,
  RouterContextProvider,
  type AnyRouter,
} from "@tanstack/react-router";

import type { ComponentProps } from "react";

function createTanStackRouterWrapper(
  router: AnyRouter = createRouter({ routeTree: createRootRoute() }),
) {
  function RouterWrapper(props: Omit<ComponentProps<typeof RouterContextProvider>, "router">) {
    return <RouterContextProvider {...props} router={router} />;
  }

  return { router, wrapper: RouterWrapper };
}

export { createTanStackRouterWrapper };
