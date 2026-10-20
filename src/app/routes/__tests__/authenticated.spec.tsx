import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Route as AuthenticatedRoute } from "@/app/routes/_authenticated";
import { Route as ProfileRoute } from "@/app/routes/_authenticated/profile";
import { getSessionFn } from "@/shared/auth";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

vi.mock(import("@/shared/auth"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    getSessionFn: vi.fn<() => void>() as unknown as typeof actual.getSessionFn,
  };
});

vi.mock(import("@/pages/profile"), () => ({
  ProfilePage: () => <div>Mocked Profile Page</div>,
}));

vi.mock(import("@tanstack/react-router"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    Outlet: (() => <div>Mocked Child Outlet</div>) as unknown as typeof actual.Outlet,
  };
});

function getBeforeLoad() {
  const { beforeLoad } = AuthenticatedRoute.options;
  if (!beforeLoad) {
    throw new TypeError("Expected beforeLoad to be defined");
  }
  return beforeLoad;
}

function getAuthenticatedLayoutComponent() {
  const { component } = AuthenticatedRoute.options;
  if (!component) {
    throw new TypeError("Expected layout component to be defined");
  }
  return component;
}

function getProfileComponent() {
  const { component } = ProfileRoute.options;
  if (!component) {
    throw new TypeError("Expected profile route component to be defined");
  }
  return component;
}

type BeforeLoadArgs = NonNullable<Parameters<ReturnType<typeof getBeforeLoad>>[0]>;

describe("_authenticated route beforeLoad guard", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns session context when user is authenticated", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValueOnce(TEST_SESSION);
    const beforeLoad = getBeforeLoad();
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const emptyArgs = {} as unknown as BeforeLoadArgs;

    // Act
    const context: unknown = await beforeLoad(emptyArgs);

    // Assert
    expect(context).toStrictEqual({ session: TEST_SESSION });
  });

  it("throws a redirect to root when user is unauthenticated", async () => {
    expect.assertions(1);

    // Arrange
    // oxlint-disable-next-line unicorn/no-null
    vi.mocked(getSessionFn).mockResolvedValueOnce(null);
    const beforeLoad = getBeforeLoad();
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const emptyArgs = {} as unknown as BeforeLoadArgs;

    // Act
    async function act() {
      await beforeLoad(emptyArgs);
    }

    // Assert
    await expect(act).rejects.toMatchObject({
      options: { to: "/" },
    });
  });
});

describe("_authenticated route component layout", () => {
  afterEach(cleanup);

  it("renders the child outlet in authenticated layout", () => {
    expect.assertions(1);

    // Act
    const Component = getAuthenticatedLayoutComponent();
    render(<Component />);

    // Assert
    expect(screen.getByText("Mocked Child Outlet")).toBeDefined();
  });
});

describe("_authenticated/profile route component", () => {
  afterEach(cleanup);

  it("renders the ProfilePage component", () => {
    expect.assertions(1);

    // Act
    const Component = getProfileComponent();
    render(<Component />);

    // Assert
    expect(screen.getByText("Mocked Profile Page")).toBeDefined();
  });
});
