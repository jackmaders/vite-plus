import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { HeadContent, Link, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";

import { ServerErrorPage } from "@/pages/server-error";
import { Toaster } from "@/shared/ui/shadcn/toast";

import { Footer, Header } from "../layouts";

import appCss from "../styles/styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  errorComponent: ServerErrorPage,
  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
    ],
    meta: [
      {
        charSet: "utf8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function NotFound() {
  return (
    <main className="mx-auto w-page px-4 py-16 text-center">
      <h1 className="font-display text-4xl font-bold tracking-tight text-(--sea-ink) sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mt-4 text-base text-(--sea-ink-soft)">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-8">
        <Link
          className="inline-flex items-center justify-center rounded-xl bg-(--sea-ink) px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:opacity-90"
          to="/"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.dataset["hydrated"] = "true";
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body
        className="flex min-h-svh flex-col font-sans wrap-anywhere antialiased"
        data-hydrated="false"
      >
        <Header />
        {children}
        <Footer />
        <Toaster />
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: () => <TanStackRouterDevtoolsPanel />,
            },
            {
              id: "react-query",
              name: "React Query",
              render: () => <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
