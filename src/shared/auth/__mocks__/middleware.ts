import { createMiddleware } from "@tanstack/react-start";

const authMiddleware = createMiddleware({
  type: "function",
  // oxlint-disable-next-line typescript/promise-function-async
}).server(({ next }) => next());

export { authMiddleware };
