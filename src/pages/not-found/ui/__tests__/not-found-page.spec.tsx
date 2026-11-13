import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { NotFoundPage } from "../not-found-page";

vi.mock(
  import("@tanstack/react-router"),
  () =>
    ({
      Link: ({ children, to, ...props }: { children?: React.ReactNode; to?: string }) => (
        <a href={to} {...props}>
          {children}
        </a>
      ),
    }) as never,
);

describe("not found page", () => {
  it("renders heading and link back to home", () => {
    expect.assertions(3);

    render(<NotFoundPage />);

    expect(screen.getByRole("heading", { name: "Page Not Found" })).toBeDefined();
    expect(
      screen.getByText("The page you are looking for does not exist or has been moved."),
    ).toBeDefined();
    expect(screen.getByRole("link", { name: "Return Home" }).getAttribute("href")).toBe("/");
  });
});
