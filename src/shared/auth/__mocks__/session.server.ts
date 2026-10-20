import { vi } from "vite-plus/test";

// oxlint-disable-next-line unicorn/no-null
const ensureSession = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);
// oxlint-disable-next-line unicorn/no-null
const getSession = vi.fn<() => Promise<unknown>>().mockResolvedValue(null);

export { ensureSession, getSession };
