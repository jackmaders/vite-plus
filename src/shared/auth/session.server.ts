import { getRequestHeaders } from "@tanstack/react-start/server";

import { ApplicationError } from "../errors";
import { auth } from "./auth.server";

async function getSession() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return session;
}

async function ensureSession() {
  const session = await getSession();

  if (!session) {
    throw new ApplicationError("SESSION_REQUIRED", "Please sign in to continue.", { status: 401 });
  }

  return session;
}

export { ensureSession, getSession };
