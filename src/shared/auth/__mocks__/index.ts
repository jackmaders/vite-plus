export { authClient, signIn, signOut, signUp, useSession } from "./auth.client";
export { getSessionFn } from "./session.functions";
export { authMiddleware } from "../middleware";
export type { Session, User } from "@/shared/db/schema";
