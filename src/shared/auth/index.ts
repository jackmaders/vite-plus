import type { authClient } from "./auth.client";

type Session = typeof authClient.$Infer.Session;
type User = typeof authClient.$Infer.Session.user;

export { getSessionFn } from "./session.functions";
export { authMiddleware } from "./middleware";
export type { Session, User };
