import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";

import { getDb } from "../db/index.server";
import { account, session, user, verification } from "../db/schema";

const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(getDb(), {
    provider: "sqlite",
    schema: { account, session, user, verification },
  }),
  emailAndPassword: { enabled: true },
  plugins: [tanstackStartCookies()],
  secret: env.BETTER_AUTH_SECRET,
});

export { auth };
