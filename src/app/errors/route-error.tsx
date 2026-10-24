import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";

import { getErrorMessage } from "@/shared/errors";
import { Button } from "@/shared/ui/shadcn/button";

function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const queryReset = useQueryErrorResetBoundary();

  return (
    <main className="mx-auto flex w-page flex-col gap-4 px-4 py-8">
      <h1>Unable to display this page</h1>
      <p role="alert">{getErrorMessage(error)}</p>
      <Button
        type="button"
        onClick={() => {
          queryReset.reset();
          reset();
          void router.invalidate();
        }}
      >
        Try again
      </Button>
    </main>
  );
}

export { RouteError };
