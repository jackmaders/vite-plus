import { createRoute, createRouter } from "@tanstack/react-router";

import { Route as routeTree } from "./routes/__root";

function getRouter() {
  const indexRoute = createRoute({
    getParentRoute: () => routeTree,
    path: "/",
  });
  return createRouter({ routeTree: routeTree.addChildren([indexRoute]) });
}

export { getRouter };
