// eslint-disable-next-line import/no-unassigned-import -- Start compiler marker for server-only imports.
import "@tanstack/react-start/server-only";
import { getRequest } from "@tanstack/react-start/server";
import { ZodError } from "zod";

import { ApplicationError } from "./errors";

const MIN_SERVER_ERROR_STATUS = 500;
type ReportedError = ApplicationError & { referenceId: string };

// Request keys prevent one reused Error from suppressing reports on later requests.
const requestReports = new WeakMap<Request, WeakMap<Error, ReportedError>>();

/**
 * The single reporting sink for application failures.
 *
 * @param {unknown} cause - The original failure.
 *
 * @returns {ApplicationError} A public error with a reference ID; deduplicated within an active
 *   request.
 */
function reportServerError(cause: unknown): ReportedError {
  const reportedErrors = getRequestReports();
  const previous = cause instanceof Error && reportedErrors.get(cause);
  if (previous instanceof ApplicationError) {
    return previous;
  }

  const reported = createReportedError(cause);
  if (cause instanceof Error) {
    reportedErrors.set(cause, reported);
  }
  reportedErrors.set(reported, reported);

  logServerError(reported, cause);
  return reported;
}

function createReportedError(cause: unknown) {
  const error = classifyError(cause);
  return Object.assign(
    new ApplicationError(error.code, error.message, { cause, status: error.status }),
    {
      referenceId: error.referenceId ?? crypto.randomUUID(),
    },
  );
}

function getRequestReports() {
  try {
    const request = getRequest();
    const existing = requestReports.get(request);
    if (existing) {
      return existing;
    }
    const reports = new WeakMap<Error, ReportedError>();
    requestReports.set(request, reports);
    return reports;
  } catch {
    // Background tasks have no request scope in which to deduplicate reports.
    return new WeakMap<Error, ReportedError>();
  }
}

function logServerError(error: ApplicationError, cause: unknown) {
  const entry = {
    code: error.code,
    event: "application_error",
    referenceId: error.referenceId,
    // Vendor messages can contain SQL, parameters or credentials. Keep frames only.
    stack:
      cause instanceof Error ? cause.stack?.split("\n").filter((line) => isStackFrame(line)) : [],
    status: error.status,
  };
  if (error.status < MIN_SERVER_ERROR_STATUS) {
    // eslint-disable-next-line no-console -- Central structured logging sink.
    console.warn(entry);
  } else {
    // eslint-disable-next-line no-console -- Central structured logging sink.
    console.error(entry);
  }
}

function classifyError(cause: unknown): ApplicationError {
  if (cause instanceof ApplicationError) {
    return cause;
  }
  if (cause instanceof ZodError) {
    return new ApplicationError("INVALID_INPUT", "Please check your input and try again.", {
      cause,
      status: 400,
    });
  }
  return ApplicationError.from(cause);
}

function isStackFrame(line: string) {
  return line.trimStart().startsWith("at ");
}

export { reportServerError };
