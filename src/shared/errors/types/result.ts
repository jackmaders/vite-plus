import type { ApplicationError } from "../application-error";

type Result<TData, TError extends Error = ApplicationError> =
  | { status: "success"; data: TData; error?: never }
  | { status: "error"; data?: never; error: TError };

export type { Result };
