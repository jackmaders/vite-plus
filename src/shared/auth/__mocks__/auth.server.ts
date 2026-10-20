import { vi } from "vite-plus/test";

const auth = {
  api: {
    getSession: vi.fn<() => Promise<unknown>>().mockResolvedValue(null),
  },
  handler: vi.fn<() => Promise<Response>>(),
  options: {
    baseURL: "http://localhost:5173",
    emailAndPassword: { enabled: true },
    secret: "test-secret-at-least-32-characters-long",
  },
};

export { auth };
