import { createMiddleware } from "@tanstack/react-start";

const errorMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { withServerErrorHandling } = await import("./middleware.server");
  return await withServerErrorHandling(next);
});

export { errorMiddleware };
