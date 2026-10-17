import { cleanup, render, screen, within } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test";

import { Footer } from "@/components/footer";

describe("footer copyright", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2042-06-15T12:00:00Z"));
    vi.resetModules();
  });

  afterEach(cleanup);

  afterAll(() => {
    vi.useRealTimers();
  });

  it("displays the current copyright year and framework attribution", async () => {
    expect.assertions(2);

    // Act
    const { Footer: DatedFooter } = await import("@/components/footer");
    render(<DatedFooter />);

    const footer = within(screen.getByRole("contentinfo"));

    // Assert
    expect(footer.getByText("© 2042 Your name here. All rights reserved.")).toBeDefined();
    expect(footer.getByText("Built with TanStack Start")).toBeDefined();
  });
});

describe("footer social links", () => {
  afterEach(cleanup);

  it("provides an accessible external link to X", () => {
    expect.assertions(3);

    // Act
    render(<Footer />);

    const link = screen.getByRole("link", { name: "Follow TanStack on X" });

    // Assert
    expect(link.getAttribute("href")).toBe("https://x.com/tan_stack");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toMatch(/(?:^|\s)noreferrer(?:\s|$)/u);
  });

  it("provides an accessible external link to GitHub", () => {
    expect.assertions(3);

    // Act
    render(<Footer />);

    const link = screen.getByRole("link", { name: "Go to TanStack GitHub" });

    // Assert
    expect(link.getAttribute("href")).toBe("https://github.com/TanStack");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toMatch(/(?:^|\s)noreferrer(?:\s|$)/u);
  });
});
