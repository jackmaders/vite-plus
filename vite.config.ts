import { defineConfig, lazyPlugins } from "vite-plus";

export default defineConfig(({ mode }) => ({
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts"],
    jsdoc: { descriptionWithDot: true, separateTagGroups: true },
    sortImports: { internalPattern: ["@/", "@test/"] },
    sortPackageJson: { sortScripts: true },
    sortTailwindcss: { stylesheet: "./src/styles.css" },
  },
  ...lintConfig,
  plugins: mode === "test" ? [] : (lazyPlugins(loadPlugins) ?? []),
  resolve: { tsconfigPaths: true },
  staged: { "*": "vp check --fix" },
  test: {
    coverage: {
      exclude: ["src/routeTree.gen.ts"],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      thresholds: { 100: true, perFile: true },
    },
    environment: "happy-dom",
    globals: false,
  },
}));

const lintConfig = defineConfig({
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
    ignorePatterns: ["src/routeTree.gen.ts"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    options: { typeAware: true, typeCheck: true },
    overrides: [
      { env: { browser: true }, files: ["src/**"] },
      {
        files: ["tests/vitest/**"],
        rules: { "react/only-export-components": "off" },
      },
      {
        files: ["tests/e2e/**"],
        rules: { "vitest/prefer-importing-vitest-globals": "off" },
      },
      {
        files: ["**/*.{test,spec}.{ts,tsx}"],
        rules: { "eslint/no-magic-numbers": "off" },
      },
      {
        files: ["src/routes/**"],
        rules: { "react/only-export-components": "off" },
      },
      {
        env: { node: true },
        files: ["*.config.ts"],
        rules: {
          "import/no-default-export": "off",
          "node/no-process-env": "off",
        },
      },
    ],
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
      "vitest",
    ],
    rules: {
      "eslint/func-style": ["error", "declaration"],
      "eslint/no-ternary": "off",
      "eslint/no-use-before-define": "off",
      "eslint/one-var": ["error", "never"],
      "eslint/sort-imports": "off",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level-if-only-type-imports"],
      "import/exports-last": "off",
      "import/no-default-export": "error",
      "import/no-duplicates": ["error", { preferInline: true }],
      "import/no-named-export": "off",
      "import/prefer-default-export": "off",
      "oxc/no-async-await": "off",
      "oxc/no-rest-spread-properties": "off",
      "react-perf/jsx-no-new-array-as-prop": "off",
      "react-perf/jsx-no-new-function-as-prop": "off",
      "react-perf/jsx-no-new-object-as-prop": "off",
      "react/forbid-component-props": "off",
      "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
      "react/jsx-max-depth": ["error", { max: 4 }],
      "react/jsx-no-literals": "off",
      "react/jsx-props-no-spreading": "off",
      "react/no-multi-comp": "off",
      "react/react-in-jsx-scope": "off",
      "typescript/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "typescript/explicit-function-return-type": "off",
      "typescript/explicit-module-boundary-types": "off",
      "typescript/prefer-readonly-parameter-types": "off",
      "unicorn/prefer-global-this": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
      "vitest/consistent-test-filename": [
        "error",
        { allTestPattern: "__tests__", pattern: "\\.spec\\.[tj]sx?$" },
      ],
      "vitest/no-hooks": "off",
      "vitest/no-importing-vitest-globals": "off",
      "vitest/prefer-importing-vitest-globals": "error",
      "vitest/require-test-timeout": "off",
    },
  },
});

async function loadPlugins() {
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
}
