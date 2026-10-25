import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

import { errorMiddleware } from "@/shared/errors";

const startInstance = createStart(() => ({
  functionMiddleware: [errorMiddleware],
  requestMiddleware: [
    createCsrfMiddleware({ filter: (context) => context.handlerType === "serverFn" }),
  ],
}));

export { startInstance };
