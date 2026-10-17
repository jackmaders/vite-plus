import { defineConfig, lazyPlugins } from "vite-plus";

const config = defineConfig({
  fmt: {},
  lint: {
    categories: {
      correctness: "error",
      nursery: "error",
      pedantic: "error",
      perf: "error",
      restriction: "error",
      style: "error",
      suspicious: "error",
    },
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    options: { typeAware: true, typeCheck: true },
    plugins: [
      "eslint",
      "typescript",
      "unicorn",
      "oxc",
      "import",
      "jsdoc",
      "jsx-a11y",
      "react",
      "react-perf",
      "promise",
      "node",
    ],
    rules: {
      "eslint/func-style": ["error", "declaration"],
      "eslint/no-ternary": "off",
      "eslint/no-use-before-define": "off",
      "import/exports-last": "off",
      "import/no-named-export": "off",
      "oxc/no-async-await": "off",
      "oxc/no-rest-spread-properties": "off",
      "react/jsx-max-depth": ["error", { max: 4 }],
      "react/jsx-no-literals": "off",
      "react/no-multi-comp": "off",
      "react/react-in-jsx-scope": "off",
      "typescript/explicit-function-return-type": "off",
      "typescript/explicit-module-boundary-types": "off",
      "typescript/prefer-readonly-parameter-types": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
  },
  plugins: lazyPlugins(async () => {
    const [
      { devtools },
      { cloudflare },
      { default: tailwindcss },
      { tanstackStart },
      { default: viteReact },
    ] = await Promise.all([
      import("@tanstack/devtools-vite"),
      import("@cloudflare/vite-plugin"),
      import("@tailwindcss/vite"),
      import("@tanstack/react-start/plugin/vite"),
      import("@vitejs/plugin-react"),
    ]);
    return [
      devtools(),
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ];
  }),
  resolve: { tsconfigPaths: true },
  staged: {
    "*": "vp check --fix",
  },
});

export default config;
