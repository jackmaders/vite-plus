export function ServerErrorPage() {
  return (
    <main className="mx-auto w-page px-4 py-16 text-center">
      <h1 className="font-display text-4xl font-bold tracking-tight text-(--sea-ink) sm:text-5xl">
        This page couldn’t load
      </h1>
      <p className="mt-4 text-base text-(--sea-ink-soft)">
        Something went wrong. Please try again.
      </p>
    </main>
  );
}
