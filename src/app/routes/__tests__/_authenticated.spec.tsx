import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route as AuthenticatedRoute } from "@/app/routes/_authenticated";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

vi.mock(import("@tanstack/react-router"), (async (importOriginal: () => Promise<unknown>) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
}) as never);

function getBeforeLoad() {
  const options = AuthenticatedRoute.options as unknown as {
    beforeLoad?: (ctx: unknown) => unknown;
  };
  const { beforeLoad } = options;
  if (!beforeLoad) {
    throw new TypeError("Expected beforeLoad to be defined");
  }
  return beforeLoad;
}

describe("_authenticated route beforeLoad guard", () => {
  it("returns session context when user is authenticated", () => {
    expect.assertions(1);

    // Arrange
    const beforeLoad = getBeforeLoad();
    const args = { context: { session: TEST_SESSION } };

    // Act
    const context = beforeLoad(args);

    // Assert
    expect(context).toStrictEqual({ session: TEST_SESSION });
  });

  it("throws a redirect to / when user is unauthenticated", () => {
    expect.assertions(1);

    // Arrange
    const beforeLoad = getBeforeLoad();
    const args = { context: { session: null } };

    // Assert
    expect(() => beforeLoad(args)).toThrow(
      expect.objectContaining({
        options: expect.objectContaining({ to: "/" }) as unknown,
      }),
    );
  });
});

describe("_authenticated route layout", () => {
  it("renders AuthenticatedLayout component with outlet", () => {
    expect.assertions(1);

    // Arrange
    const options = AuthenticatedRoute.options as unknown as { component: React.ComponentType };
    const Component = options.component;

    // Act
    render(<Component />);

    // Assert
    expect(screen.getByText("Outlet Content")).toBeDefined();
  });
});
