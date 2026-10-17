import { defineConfig, lazyPlugins } from "vite-plus";

const config = defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: { tsconfigPaths: true },
  plugins: lazyPlugins(async () => [
    (await import("@tanstack/devtools-vite")).devtools(),
    (await import("@cloudflare/vite-plugin")).cloudflare({ viteEnvironment: { name: "ssr" } }),
    (await import("@tailwindcss/vite")).default(),
    (await import("@tanstack/react-start/plugin/vite")).tanstackStart(),
    (await import("@vitejs/plugin-react")).default(),
  ]),
});

export default config;
