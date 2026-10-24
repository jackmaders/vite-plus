import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

import { functionErrorMiddleware, requestErrorMiddleware } from "./errors/middleware";
import { errorSerializationAdapter } from "./errors/serialization";

const csrfMiddleware = createCsrfMiddleware({
  filter: ({ handlerType }) => handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [functionErrorMiddleware],
  requestMiddleware: [requestErrorMiddleware, csrfMiddleware],
  serializationAdapters: [errorSerializationAdapter],
}));
