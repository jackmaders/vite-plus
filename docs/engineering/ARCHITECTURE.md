# Architecture

Applies when adding modules or changing dependencies between modules or server/client
boundaries.

## Current structure

This is a React application using TanStack Start and file-based TanStack Router
routing, configured to build for Cloudflare Workers.

- `src/routes/` contains route definitions and page-specific UI.
- `src/routes/__root.tsx` defines the shared document shell.
- `src/router.tsx` constructs the application router.
- `src/components/` contains UI reused across pages.
- `src/styles.css` defines shared styles and design tokens.

## Boundaries

- Add routes through route source files. Let TanStack generate
  `src/routeTree.gen.ts`.
- Keep credentials and privileged operations in server-only code. Review imports
  across the server/client boundary when adding server functionality.
- Extend the existing structure for small changes. Document a new module boundary
  and its reason here when a change introduces one.

## Verification

Confirm that new modules have a clear responsibility and that their callers use
the intended server or client interface. Run the build when changing module
boundaries or build configuration.

<!-- Review: Add product-specific boundaries as the starter develops. -->
