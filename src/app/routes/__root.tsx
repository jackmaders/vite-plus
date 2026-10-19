import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { Footer } from "../layouts/footer";
import { Header } from "../layouts/header";

import appCss from "../styles/styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
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
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans wrap-anywhere antialiased selection:bg-teal-500/25">
        <Header />
        {children}
        <Footer />
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
