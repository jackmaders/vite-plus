import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ["**/__tests__/**", "**/routeTree.gen.ts"],
  },
  {
    files: ["./src/**"],
    rules: {
      "fsd/import-locality": "error",
      "fsd/no-wildcard-exports": "error",
    },
  },
]);
