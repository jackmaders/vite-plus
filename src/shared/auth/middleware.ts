import { createMiddleware } from "@tanstack/react-start";

import { ensureSession } from "./session.server";

const authMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const session = await ensureSession();
  return next({ context: { session } });
});

export { authMiddleware };
