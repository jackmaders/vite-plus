import type {
  createAuthClient as actualCreateAuthClient,
  useStore as actualUseStore,
} from "better-auth/react";
import { vi } from "vite-plus/test";

const mockClient = {
  signIn: vi.fn<() => void>(),
  signOut: vi.fn<() => void>(),
  signUp: vi.fn<() => void>(),
  useSession: vi.fn<() => void>(),
};

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const createAuthClient = vi.fn<() => typeof mockClient>(
  () => mockClient,
) as unknown as typeof actualCreateAuthClient;
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const useStore = vi.fn<() => void>() as unknown as typeof actualUseStore;

export { createAuthClient, useStore };
