import { createServerFn } from "@tanstack/react-start";

import { ApplicationError } from "@/shared/errors";

const knownErrorFn = createServerFn({ method: "POST" }).handler(throwKnownError);
const unexpectedErrorFn = createServerFn({ method: "GET" }).handler(throwUnexpectedError);

function throwKnownError() {
  throw new ApplicationError("TODO_NOT_FOUND", {
    cause: new Error("private database cause"),
    details: { diagnostic: "private database details" },
    message: "private diagnostic override",
  });
}

function throwUnexpectedError() {
  throw new Error("private unexpected failure");
}

export { knownErrorFn, unexpectedErrorFn };
