import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { ThemeToggle } from "@/app/layouts/theme-toggle";

const AUTO_LABEL = "Theme mode: auto (system). Click to switch to light mode.";
const DARK_LABEL = "Theme mode: dark. Click to switch mode.";
const LIGHT_LABEL = "Theme mode: light. Click to switch mode.";

describe("theme toggle initial mode", () => {
  afterEach(() => {
    delete document.documentElement.dataset["theme"];
  });

  it("starts in system mode with an accessible button", () => {
    expect.assertions(5);

    // Act
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: AUTO_LABEL });

    // Assert
    expect(button.textContent).toBe("Auto");
    expect(button.getAttribute("aria-label")).toBe(AUTO_LABEL);
    expect(button.getAttribute("title")).toBe(AUTO_LABEL);
    expect(button.getAttribute("type")).toBe("button");
    expect(document.documentElement.dataset["theme"]).toBeUndefined();
  });
});

describe("theme toggle manual modes", () => {
  afterEach(() => {
    delete document.documentElement.dataset["theme"];
  });

  it("switches from system mode to light mode", async () => {
    expect.assertions(4);

    // Arrange
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button");

    // Act
    await user.click(button);

    // Assert
    expect(button.textContent).toBe("Light");
    expect(button.getAttribute("aria-label")).toBe(LIGHT_LABEL);
    expect(button.getAttribute("title")).toBe(LIGHT_LABEL);
    expect(document.documentElement.dataset["theme"]).toBe("light");
  });

  it("switches from light mode to dark mode", async () => {
    expect.assertions(4);

    // Arrange
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    await user.click(button);

    // Act
    await user.click(button);

    // Assert
    expect(button.textContent).toBe("Dark");
    expect(button.getAttribute("aria-label")).toBe(DARK_LABEL);
    expect(button.getAttribute("title")).toBe(DARK_LABEL);
    expect(document.documentElement.dataset["theme"]).toBe("dark");
  });
});

describe("theme toggle system mode", () => {
  afterEach(() => {
    delete document.documentElement.dataset["theme"];
  });

  it("returns from dark mode to system mode and removes the manual preference", async () => {
    expect.assertions(4);

    // Arrange
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    await user.dblClick(button);

    // Act
    await user.click(button);

    // Assert
    expect(button.textContent).toBe("Auto");
    expect(button.getAttribute("aria-label")).toBe(AUTO_LABEL);
    expect(button.getAttribute("title")).toBe(AUTO_LABEL);
    expect(document.documentElement.dataset["theme"]).toBeUndefined();
  });
});
