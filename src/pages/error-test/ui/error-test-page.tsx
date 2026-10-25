import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { ApplicationError } from "@/shared/errors";

import { knownErrorFn, unexpectedErrorFn } from "../api/error-test.functions";

function ErrorTestPage() {
  const [result, setResult] = useState("");
  const knownError = useServerFn(knownErrorFn);
  const unexpectedError = useServerFn(unexpectedErrorFn);

  async function triggerError(action: () => Promise<unknown>) {
    try {
      await action();
      setResult("The operation unexpectedly succeeded.");
    } catch (error) {
      setResult(
        error instanceof ApplicationError
          ? `${error.code}: ${error.message} (${error.statusCode})`
          : "Unrecognized error response.",
      );
    }
  }

  return (
    <main>
      <h1>Error response test</h1>
      <button
        type="button"
        onClick={() => {
          void triggerError(knownError);
        }}
      >
        Trigger known error
      </button>
      <button
        type="button"
        onClick={() => {
          void triggerError(unexpectedError);
        }}
      >
        Trigger unexpected error
      </button>
      <output aria-label="Server error response">{result}</output>
      <MutationErrorControls />
    </main>
  );
}

function MutationErrorControls() {
  const knownError = useServerFn(knownErrorFn);
  const unexpectedError = useServerFn(unexpectedErrorFn);
  const defaultError = useMutation({ mutationFn: knownError });
  const defaultUnexpectedError = useMutation({ mutationFn: unexpectedError });
  const inlineError = useMutation({ mutationFn: knownError });

  return (
    <section aria-label="Mutation errors">
      <button
        type="button"
        onClick={() => {
          defaultError.mutate();
        }}
      >
        Trigger default error toast
      </button>
      <button
        type="button"
        onClick={() => {
          defaultUnexpectedError.mutate();
        }}
      >
        Trigger unexpected error toast
      </button>
      <button
        type="button"
        onClick={() => {
          inlineError.mutate();
        }}
      >
        Trigger inline mutation error
      </button>
      {inlineError.error && <p role="alert">{inlineError.error.message}</p>}
    </section>
  );
}

export { ErrorTestPage };
