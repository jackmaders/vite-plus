<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes, switching worktrees, or if project-local vite-plus is missing.
- [ ] Run `vp run check:full` and `vp test` before pushing to run full CI-parity checks. Note that warnings are denied in CI (`denyWarnings: true` under `FULL_CHECK=1`) and must be treated as blocking.
- [ ] If tests fail or need detailed traces, rerun with explicit reporter: `vp test <filter> --reporter=default`.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## Context

- When adding or changing project-specific concepts or repo-defined terminology,
  read and update [GLOSSARY.md](GLOSSARY.md) in the same change. Follow
  [domain doc guidance](docs/agents/domain.md).
- When naming server or client modules, exports, functions, variables, or SQL
  columns, or changing database schemas, validation schemas, queries, component
  props, error handling, object design, code organization, comments, or function
  signatures, read [coding standards](docs/engineering/CODING_STANDARDS.md).
- When designing module interfaces, adapting vendor SDKs, adding routes, placing
  UI or form primitives, or changing route authentication, loader prefetching,
  or server functions, read [architecture](docs/engineering/ARCHITECTURE.md).
- When working with TanStack Start, Router, Query, or Form, first read
  [architecture](docs/engineering/ARCHITECTURE.md). Follow its integration
  guidance when managed skills conflict.
- When implementing new behavior or writing, reviewing, or organizing tests, read
  [testing](docs/engineering/TESTING.md).
- When organizing FSD layers, slices, or segments, defining slice public APIs,
  resolving cross-imports, or placing code or static assets, read
  [feature-sliced-design](.agents/skills/feature-sliced-design/SKILL.md).
- When adding, styling, composing, or debugging shadcn/ui components,
  registries, or presets, read [shadcn](.agents/skills/shadcn/SKILL.md).
- When auditing UI design, UX, or accessibility against web interface
  guidelines, read
  [web-design-guidelines](.agents/skills/web-design-guidelines/SKILL.md).
- When auditing or optimizing page load performance, interaction latency, Core
  Web Vitals, or Lighthouse scores, read
  [web-perf](.agents/skills/web-perf/SKILL.md).
- When configuring TanStack Start, SSR, streaming, server functions,
  middleware, or API routes, read
  [tanstack-start](.agents/skills/tanstack-start/SKILL.md).
- When configuring TanStack Router, route trees, file-based routes, search
  params, loaders, or navigation, read
  [tanstack-router](.agents/skills/tanstack-router/SKILL.md).
- When managing server state with TanStack Query, query keys, caching,
  prefetching, mutations, optimistic updates, or infinite queries, read
  [tanstack-query](.agents/skills/tanstack-query/SKILL.md).
- When building forms with TanStack Form, field or form validation, array or
  linked fields, or schema adapters, read
  [tanstack-form](.agents/skills/tanstack-form/SKILL.md).
- When building tables or datagrids with TanStack Table, column definitions,
  sorting, filtering, pagination, grouping, or row selection, read
  [tanstack-table](.agents/skills/tanstack-table/SKILL.md).
- When configuring TanStack Devtools panels or custom devtools plugins, read
  [tanstack-devtools](.agents/skills/tanstack-devtools/SKILL.md).
- When configuring Better Auth server or client instances, database adapters,
  sessions, OAuth, or plugins, read
  [better-auth-best-practices](.agents/skills/better-auth-best-practices/SKILL.md).
- When configuring Better Auth email and password authentication, email
  verification, password reset flows, or password hashing, read
  [email-and-password-best-practices](.agents/skills/email-and-password-best-practices/SKILL.md).
- When hardening Better Auth with rate limiting, secret management, CSRF
  protection, trusted origins, cookie security, token encryption, IP tracking,
  or audit logging, read
  [better-auth-security-best-practices](.agents/skills/better-auth-security-best-practices/SKILL.md).
- When defining or querying Drizzle schemas, tables, indexes, relations, joins,
  or inferred types, read [drizzle](.agents/skills/drizzle/SKILL.md).
- When performing a security review or applying secure-by-default TypeScript and
  JavaScript practices, read
  [security-best-practices](.agents/skills/security-best-practices/SKILL.md).
- When configuring Vite build options, plugins, SSR, or Rolldown migration, read
  [vite](.agents/skills/vite/SKILL.md).
- When selecting Cloudflare products or designing architecture across Workers,
  storage, networking, AI, or security, read
  [cloudflare](.agents/skills/cloudflare/SKILL.md).
- When writing, reviewing, or configuring Cloudflare Workers, bindings, or
  runtime APIs, read
  [workers-best-practices](.agents/skills/workers-best-practices/SKILL.md).
- When running or troubleshooting Wrangler CLI commands, local dev, previews,
  deployments, or `wrangler.jsonc`, read
  [wrangler](.agents/skills/wrangler/SKILL.md).
- When writing or configuring Vitest tests, mocks, fixtures, filtering, or
  coverage, read [vitest](.agents/skills/vitest/SKILL.md).
- When writing, debugging, or configuring Playwright browser tests, component
  tests, API tests, visual tests, accessibility tests, or security tests, read
  [playwright-best-practices](.agents/skills/playwright-best-practices/SKILL.md).
- When automating browser interactions or inspecting live web pages from the
  CLI, read [playwright-cli](.agents/skills/playwright-cli/SKILL.md).
