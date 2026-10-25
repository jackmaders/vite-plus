import type { QueryClient } from "@tanstack/react-query";

interface RouterInvalidator {
  invalidate: () => Promise<void>;
}

interface ResetAuthCacheOptions {
  queryClient: QueryClient;
  router?: RouterInvalidator;
}

// Resets cached private query data and synchronizes router state during authentication transitions
// (e.g. sign out, session expiry, user switch).
async function resetAuthCache({ queryClient, router }: ResetAuthCacheOptions): Promise<void> {
  await queryClient.cancelQueries();
  queryClient.clear();

  if (router) {
    await router.invalidate();
  }
}

export { resetAuthCache, type ResetAuthCacheOptions, type RouterInvalidator };
