import { useSession } from "@/shared/auth/index.client";

function ProfilePage() {
  const { data: sessionData } = useSession();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">User Profile</h1>
      <p className="mt-2 text-muted-foreground">
        This is a protected page accessible only to authenticated users.
      </p>
      {sessionData === null ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading session details...</p>
      ) : (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-foreground">Name: {sessionData.user.name}</p>
          <p className="text-sm text-muted-foreground">Email: {sessionData.user.email}</p>
        </div>
      )}
    </main>
  );
}

export { ProfilePage };
