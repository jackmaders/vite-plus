import { createFileRoute } from "@tanstack/react-router";

import { ErrorTestPage } from "@/pages/error-test";

const Route = createFileRoute("/error-test")({ component: ErrorTestPage });

export { Route };
