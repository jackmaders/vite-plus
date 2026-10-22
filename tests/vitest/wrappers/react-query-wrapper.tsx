import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentProps } from "react";

function createReactQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  function QueryWrapper(props: Omit<ComponentProps<typeof QueryClientProvider>, "client">) {
    return <QueryClientProvider {...props} client={queryClient} />;
  }

  return { queryClient, wrapper: QueryWrapper };
}

export { createReactQueryWrapper };
