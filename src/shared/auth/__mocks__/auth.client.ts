import { vi } from "vite-plus/test";

const signIn = vi.fn<() => void>();
const signOut = vi.fn<() => void>();
const signUp = vi.fn<() => void>();
const useSession = vi.fn<() => void>();

const authClient = {
  signIn,
  signOut,
  signUp,
  useSession,
};

export { authClient, signIn, signOut, signUp, useSession };
