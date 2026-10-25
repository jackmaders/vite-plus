import type { Session } from "@/shared/auth";
import { useSession } from "@/shared/auth/index.client";

interface ProfilePageProps {
  initialSession?: Session | null;
}

function ProfileContent({
  error,
  isPending,
  session,
}: {
  error: unknown;
  isPending: boolean;
  session: Session | null | undefined;
}) {
  if (session) {
    return (
      <div className="mt-4 rounded-xl border border-(--line) bg-(--card-bg) p-4">
        <p className="font-semibold text-(--sea-ink)">Name: {session.user.name}</p>
        <p className="text-sm text-(--sea-ink-soft)">Email: {session.user.email}</p>
      </div>
    );
  }

  if (isPending) {
    return <p className="mt-4 text-sm text-(--sea-ink-soft)">Loading session details...</p>;
  }

  if (error) {
    return <p className="mt-4 text-sm text-red-600">Failed to load session details.</p>;
  }

  return <p className="mt-4 text-sm text-(--sea-ink-soft)">You are not signed in.</p>;
}

function ProfilePage({ initialSession }: ProfilePageProps = {}) {
  const { data: sessionData, isPending, error } = useSession();
  const session = sessionData ?? initialSession;

  return (
    <main className="mx-auto w-page px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-(--sea-ink)">User Profile</h1>
      <p className="mt-2 text-(--sea-ink-soft)">
        This is a protected page accessible only to authenticated users.
      </p>
      <ProfileContent error={error} isPending={isPending} session={session} />
    </main>
  );
}

export { ProfilePage };
