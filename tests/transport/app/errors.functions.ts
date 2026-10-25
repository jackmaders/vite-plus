import { notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { ApplicationError } from "../../../src/shared/errors";

const knownErrorFn = createServerFn({ method: "POST" }).handler(() => {
  throw new ApplicationError("TODO_NOT_FOUND", {
    cause: new Error("private database cause"),
    details: { secret: "private database details" },
    message: "private diagnostic override",
  });
});

const unknownErrorFn = createServerFn().handler(() => {
  throw new Error("private unexpected failure");
});

const redirectFn = createServerFn().handler(() => {
  throw redirect({ href: "/redirected" });
});

const notFoundFn = createServerFn().handler(() => {
  notFound({ throw: true });
});

export { knownErrorFn, notFoundFn, redirectFn, unknownErrorFn };
