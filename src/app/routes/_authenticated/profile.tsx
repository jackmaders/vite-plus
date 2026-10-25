import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "@/pages/profile";

const Route = createFileRoute("/_authenticated/profile")({
  component: ProfileRouteComponent,
});

function ProfileRouteComponent() {
  const { session } = Route.useRouteContext();
  return <ProfilePage initialSession={session} />;
}

export { Route };
