import { cleanup, render, screen, within } from "@testing-library/react";
import { afterAll, afterEach, expect, test, vi } from "vite-plus/test";

import { Footer } from "./footer";

vi.hoisted(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2042-06-15T12:00:00Z"));
});

afterEach(cleanup);
afterAll(() => {
  vi.useRealTimers();
});

test("displays the current copyright year and framework attribution", () => {
  render(<Footer />);

  const footer = within(screen.getByRole("contentinfo"));
  expect(footer.getByText("© 2042 Your name here. All rights reserved.")).toBeTruthy();
  expect(footer.getByText("Built with TanStack Start")).toBeTruthy();
});

test.each([
  { name: "Follow TanStack on X", url: "https://x.com/tan_stack" },
  { name: "Go to TanStack GitHub", url: "https://github.com/TanStack" },
])("provides an accessible external link: $name", ({ name, url }) => {
  render(<Footer />);

  const link = screen.getByRole("link", { name });
  expect(link.getAttribute("href")).toBe(url);
  expect(link.getAttribute("target")).toBe("_blank");
  expect(link.getAttribute("rel")).toMatch(/(?:^|\s)noreferrer(?:\s|$)/u);
});
