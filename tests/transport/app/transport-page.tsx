import { HeadContent, Scripts, isNotFound, isRedirect } from "@tanstack/react-router";
import { useState } from "react";

import { ApplicationError } from "../../../src/shared/errors";
import { knownErrorFn, notFoundFn, redirectFn, unknownErrorFn } from "./errors.functions";

const functions = {
  known: knownErrorFn,
  notFound: notFoundFn,
  redirect: redirectFn,
  unknown: unknownErrorFn,
};

function TransportPage() {
  const [result, setResult] = useState("");

  async function callServerFn(scenario: keyof typeof functions) {
    try {
      await functions[scenario]();
      setResult("resolved");
    } catch (error) {
      setResult(
        JSON.stringify({
          applicationError: error instanceof ApplicationError,
          ...(error instanceof ApplicationError
            ? { code: error.code, message: error.message, statusCode: error.statusCode }
            : {}),
          notFound: isNotFound(error),
          redirect: isRedirect(error),
        }),
      );
    }
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {(["known", "unknown", "redirect", "notFound"] as const).map((scenario) => (
          <button
            key={scenario}
            type="button"
            onClick={() => {
              void callServerFn(scenario);
            }}
          >
            {scenario}
          </button>
        ))}
        <output>{result}</output>
        <Scripts />
      </body>
    </html>
  );
}

export { TransportPage };
