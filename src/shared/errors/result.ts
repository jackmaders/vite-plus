import type { ApplicationError } from "./errors";

/** Ordinary client operations return this union; Query keeps its native result. */
type Result<TData, TError extends Error = ApplicationError> =
  | { status: "success"; data: TData; error?: never }
  | { status: "error"; data?: never; error: TError };

export type { Result };
