import { vi } from "vite-plus/test";

const signIn = {
  email: vi.fn<() => Promise<unknown>>(),
};
const signOut = vi.fn<() => Promise<unknown>>().mockResolvedValue({});
const signUp = {
  email: vi.fn<() => Promise<unknown>>(),
};
const useSession = vi.fn<() => { data: unknown; isPending: boolean }>().mockReturnValue({
  data: null,
  isPending: false,
});

const authClient = {
  signIn,
  signOut,
  signUp,
  useSession,
};

export { authClient, signIn, signOut, signUp, useSession };
