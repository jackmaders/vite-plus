import { describe, expect, it } from "vite-plus/test";

import { getRouter } from "@/app/router";

describe("router route matching", () => {
  it("matches the home page within the root document", () => {
    expect.assertions(1);

    // Act
    const router = getRouter();
    const matches = router.matchRoutes("/");

    // Assert
    expect(matches.map((match) => match.routeId)).toStrictEqual(["__root__", "/"]);
  });

  it("matches the about page within the root document", () => {
    expect.assertions(1);

    // Act
    const router = getRouter();
    const matches = router.matchRoutes("/about");

    // Assert
    expect(matches.map((match) => match.routeId)).toStrictEqual(["__root__", "/about"]);
  });

  it("does not match a page for unknown paths", () => {
    expect.assertions(1);

    // Act
    const router = getRouter();
    const matches = router.matchRoutes("/missing");

    // Assert
    expect(matches.map((match) => match.routeId)).toStrictEqual(["__root__"]);
  });
});

describe("router instance isolation", () => {
  it("creates independent routers so changing one does not affect another", () => {
    expect.assertions(3);

    // Arrange
    const first = getRouter();
    const second = getRouter();

    // Act
    first.update({ defaultPreload: "render" });

    // Assert
    expect(first).not.toBe(second);
    expect(first.options.defaultPreload).toBe("render");
    expect(second.options.defaultPreload).toBe("intent");
  });
});
