import { createMiddleware } from "@tanstack/react-start";

const authMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const { ensureSession } = await import("./session.server");
  const session = await ensureSession();
  return await next({ context: { session } });
});

export { authMiddleware };
