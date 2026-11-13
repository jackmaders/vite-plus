import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Route as RootRoute } from "@/app/routes/__root";
import { ErrorPage } from "@/pages/error";
import { NotFoundPage } from "@/pages/not-found";
import { getSessionFn } from "@/shared/auth";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

vi.mock(import("@/shared/auth"), (async (importOriginal: () => Promise<unknown>) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    getSessionFn: vi.fn<() => Promise<unknown>>(),
  };
}) as never);
vi.mock(import("@/app/styles/index.css?url"), () => ({ default: "/index.css" }) as never);
vi.mock(
  import("@/app/layouts"),
  () =>
    ({
      Devtools: () => <div>Devtools</div>,
      Footer: () => <footer role="contentinfo">Footer</footer>,
      Header: () => <header role="banner">Header</header>,
    }) as never,
);
vi.mock(
  import("@/shared/ui/shadcn/toast"),
  () =>
    ({
      Toaster: () => <div />,
    }) as never,
);
vi.mock(import("@tanstack/react-router"), (async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@tanstack/react-router");
  return {
    ...actual,
    HeadContent: () => null,
    Scripts: () => null,
  };
}) as never);

afterEach(() => {
  vi.restoreAllMocks();
});

function getBeforeLoad() {
  const options = RootRoute.options as unknown as { beforeLoad?: (ctx: never) => unknown };
  const { beforeLoad } = options;
  if (!beforeLoad) {
    throw new TypeError("Expected beforeLoad to be defined");
  }
  return beforeLoad;
}

function getHead() {
  const options = RootRoute.options as unknown as {
    head?: (ctx: never) => { meta?: Record<string, unknown>[]; links?: Record<string, unknown>[] };
  };
  const { head } = options;
  if (!head) {
    throw new TypeError("Expected head to be defined");
  }
  return head;
}

function getShellComponent() {
  const options = RootRoute.options as unknown as {
    shellComponent?: React.ComponentType<{ children?: React.ReactNode }>;
  };
  const { shellComponent } = options;
  if (!shellComponent) {
    throw new TypeError("Expected shellComponent to be defined");
  }
  return shellComponent;
}

describe("root route document metadata", () => {
  it("defines title, charset, viewport, and stylesheet metadata in head", () => {
    expect.assertions(4);

    // Arrange
    const head = getHead();

    // Act
    const result = head({} as never);

    // Assert
    expect(result.meta).toContainEqual({ title: "TanStack Start Starter" });
    expect(result.meta).toContainEqual({ charSet: "utf8" });
    expect(result.meta).toContainEqual({
      content: "width=device-width, initial-scale=1",
      name: "viewport",
    });
    expect(result.links).toContainEqual(
      expect.objectContaining({
        href: "/index.css",
        rel: "stylesheet",
      }),
    );
  });
});

describe("root route layout and shellComponent", () => {
  it("renders shell document with banner, main, contentinfo, and marks document hydrated", () => {
    expect.assertions(5);

    // Arrange
    const Shell = getShellComponent();

    // Act
    render(
      <Shell>
        <p>Child content</p>
      </Shell>,
      { container: document },
    );

    // Assert
    expect(screen.getByRole("banner")).toBeDefined();
    expect(screen.getByRole("main")).toBeDefined();
    expect(screen.getByRole("contentinfo")).toBeDefined();
    expect(screen.getByText("Child content")).toBeDefined();
    expect(document.body.dataset["hydrated"]).toBe("true");
  });
});

describe("root route errorComponent and notFoundComponent", () => {
  it("configures ErrorPage as errorComponent and NotFoundPage as notFoundComponent", () => {
    expect.assertions(2);

    // Arrange
    const options = RootRoute.options as unknown as {
      errorComponent?: unknown;
      notFoundComponent?: unknown;
    };

    // Assert
    expect(options.errorComponent).toBe(ErrorPage);
    expect(options.notFoundComponent).toBe(NotFoundPage);
  });
});

describe("root route beforeLoad", () => {
  it("populates session context from getSessionFn when authenticated", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValueOnce(TEST_SESSION);
    const beforeLoad = getBeforeLoad();

    // Act
    const context = await beforeLoad({} as never);

    // Assert
    expect(context).toStrictEqual({ session: TEST_SESSION });
  });

  it("populates null session context when unauthenticated", async () => {
    expect.assertions(1);

    // Arrange
    vi.mocked(getSessionFn).mockResolvedValueOnce(null);
    const beforeLoad = getBeforeLoad();

    // Act
    const context = await beforeLoad({} as never);

    // Assert
    expect(context).toStrictEqual({ session: null });
  });
});
