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
      <output>{result}</output>
    </main>
  );
}

export { ErrorTestPage };
