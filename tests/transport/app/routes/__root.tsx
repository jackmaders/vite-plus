import { createRootRoute } from "@tanstack/react-router";

import { TransportPage } from "../transport-page";

const Route = createRootRoute({ component: TransportPage });

export { Route };
