import { useRouter } from "@tanstack/react-router";

import { getErrorMessage } from "@/shared/errors";
import { Button } from "@/shared/ui/shadcn/button";

function RouteError({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();

  async function retry() {
    reset();
    try {
      await router.invalidate();
    } catch {
      reset();
    }
  }

  return (
    <main className="mx-auto w-page px-4 py-16 text-center">
      <h1 className="font-display text-4xl font-bold tracking-tight text-(--sea-ink) sm:text-5xl">
        This page couldn’t load
      </h1>
      <p className="mt-4 text-base text-(--sea-ink-soft)">{getErrorMessage(error)}</p>
      <div className="mt-8">
        <Button
          onClick={() => {
            // Event handlers cannot return the retry promise to React.
            // eslint-disable-next-line promise/prefer-await-to-then
            retry().catch(reset);
          }}
        >
          Try again
        </Button>
      </div>
    </main>
  );
}

export { RouteError };
