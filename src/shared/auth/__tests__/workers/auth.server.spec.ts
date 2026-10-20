import { env } from "cloudflare:workers";
import { describe, expect, it } from "vite-plus/test";

import { auth } from "@/shared/auth/auth.server";

describe("auth server worker configuration", () => {
  it("initializes Better Auth with worker bindings and enabled plugins", () => {
    expect.assertions(5);

    // Assert
    expect(auth.options.baseURL).toBe(env.BETTER_AUTH_URL);
    expect(auth.options.secret).toBe(env.BETTER_AUTH_SECRET);
    expect(auth.options.emailAndPassword).toStrictEqual({ enabled: true });
    expect(auth.handler).toBeTypeOf("function");
    expect(auth.api.getSession).toBeTypeOf("function");
  });
});
