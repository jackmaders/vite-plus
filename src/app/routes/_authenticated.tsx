import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getSessionFn } from "@/shared/auth";

const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const session = await getSessionFn();

    if (!session) {
      throw redirect({ to: "/" });
    }

    return { session };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}

export { Route };
