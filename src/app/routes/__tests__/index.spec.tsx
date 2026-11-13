import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { Route as IndexRoute } from "@/app/routes/index";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

vi.mock(
  import("@/pages/home"),
  () =>
    ({
      HomePage: () => <h1>Home Page</h1>,
    }) as never,
);

function getBeforeLoad() {
  const options = IndexRoute.options as unknown as { beforeLoad?: (ctx: unknown) => unknown };
  const { beforeLoad } = options;
  if (!beforeLoad) {
    throw new TypeError("Expected beforeLoad to be defined");
  }
  return beforeLoad;
}

function getComponent() {
  const options = IndexRoute.options as unknown as { component?: React.ComponentType };
  const { component } = options;
  if (!component) {
    throw new TypeError("Expected component to be defined");
  }
  return component;
}

describe("index route beforeLoad guard", () => {
  it("redirects authenticated user to /todos", () => {
    expect.assertions(1);

    // Arrange
    const beforeLoad = getBeforeLoad();
    const args = { context: { session: TEST_SESSION } };

    // Assert
    expect(() => {
      beforeLoad(args);
    }).toThrow(
      expect.objectContaining({
        options: expect.objectContaining({ to: "/todos" }) as unknown,
      }),
    );
  });

  it("does not redirect unauthenticated user", () => {
    expect.assertions(1);

    // Arrange
    const beforeLoad = getBeforeLoad();
    const args = { context: { session: null } };

    // Assert
    expect(() => {
      beforeLoad(args);
    }).not.toThrow();
  });
});

describe("index route presentation", () => {
  it("renders HomePage via Route component option", () => {
    expect.assertions(1);

    // Arrange
    const Component = getComponent();

    // Act
    render(<Component />);

    // Assert
    expect(screen.getByRole("heading", { name: "Home Page" })).toBeDefined();
  });
});
