import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [
    cloudflare({
      configPath: `${import.meta.dirname}/wrangler.jsonc`,
      persistState: false,
      viteEnvironment: { name: "ssr" },
    }),
    tanstackStart({
      router: { generatedRouteTree: "../../../.tanstack/transport-routeTree.gen.ts" },
      srcDirectory: "app",
    }),
    react(),
  ],
  resolve: { tsconfigPaths: true },
  root: import.meta.dirname,
});
