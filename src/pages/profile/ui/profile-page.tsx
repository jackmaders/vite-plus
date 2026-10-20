import { useSession } from "@/shared/auth/index.client";

function ProfilePage() {
  const { data: sessionData } = useSession();

  return (
    <main className="mx-auto w-page px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-(--sea-ink)">User Profile</h1>
      <p className="mt-2 text-(--sea-ink-soft)">
        This is a protected page accessible only to authenticated users.
      </p>
      {sessionData === null ? (
        <p className="mt-4 text-sm text-(--sea-ink-soft)">Loading session details...</p>
      ) : (
        <div className="mt-4 rounded-xl border border-(--line) bg-(--card-bg) p-4">
          <p className="font-semibold text-(--sea-ink)">Name: {sessionData.user.name}</p>
          <p className="text-sm text-(--sea-ink-soft)">Email: {sessionData.user.email}</p>
        </div>
      )}
    </main>
  );
}

export { ProfilePage };
