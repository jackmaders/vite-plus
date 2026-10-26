import type { APIResponse, Page } from "@playwright/test";

interface SignUpOptions {
  baseURL?: string;
  email?: string;
  name?: string;
  password?: string;
}

interface SignInOptions {
  baseURL?: string;
  email?: string;
  password?: string;
}

class AuthClient {
  private readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
  }

  public async signUp({
    baseURL,
    email = `user-${globalThis.crypto.randomUUID()}@example.com`,
    name = "Test User",
    password = "test-password-1234",
  }: SignUpOptions = {}): Promise<APIResponse> {
    const headers = baseURL ? { Origin: String(baseURL) } : {};
    return await this.page.request.post("/api/auth/sign-up/email", {
      data: { email, name, password },
      headers,
    });
  }

  public async signIn({
    baseURL,
    email = "missing-user@example.com",
    password = "invalid-test-password",
  }: SignInOptions = {}): Promise<APIResponse> {
    const headers = baseURL ? { Origin: String(baseURL) } : {};
    return await this.page.request.post("/api/auth/sign-in/email", {
      data: { email, password },
      headers,
    });
  }
}

export { AuthClient };
export type { SignInOptions, SignUpOptions };
