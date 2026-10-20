import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();
const { signIn, signOut, signUp, useSession } = authClient;

export { authClient, signIn, signOut, signUp, useSession };
