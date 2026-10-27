import { createFileRoute, redirect } from "@tanstack/react-router";

import { HomePage } from "@/pages/home";
import { getSessionFn } from "@/shared/auth";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (session) {
      throw redirect({ to: "/todos" });
    }
  },
  component: HomePage,
});
