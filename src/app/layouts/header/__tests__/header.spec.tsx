import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { Header } from "@/app/layouts/header";
import { applyTheme } from "@/app/theme";
import { signOut, useSession, type Session } from "@/shared/auth";
import { TEST_SESSION } from "@test/vitest/fixtures/session";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

vi.mock(import("@/shared/auth"));

afterEach(() => {
  vi.restoreAllMocks();
});

async function renderHeader({
  initialEntry = "/",
  session = null,
}: {
  initialEntry?: string;
  session?: Session | null;
} = {}) {
  vi.mocked(useSession).mockReturnValue({ data: session, isPending: false } as never);
  const { router, wrapper } = createTestingWrapper({
    context: { session },
    initialLocation: initialEntry,
    routePaths: ["/", "/about", "/todos"],
  });
  await router.load();
  render(<Header />, { wrapper });
}

describe("header identity and navigation", () => {
  it("provides a branded home link and navigation links", async () => {
    expect.assertions(3);

    // Arrange & Act
    await renderHeader();
    const banner = screen.getByRole("banner");

    // Assert
    expect(within(banner).getByRole("link", { name: "App" }).getAttribute("href")).toBe("/");
    expect(within(banner).getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    expect(within(banner).getByRole("link", { name: "About" }).getAttribute("href")).toBe("/about");
  });

  it("shows sign in button when user is unauthenticated", async () => {
    expect.assertions(1);

    // Arrange & Act
    await renderHeader({ session: null });

    // Assert
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();
  });

  it("shows todos link and sign out button when user is authenticated", async () => {
    expect.assertions(2);

    // Arrange & Act
    await renderHeader({ initialEntry: "/todos", session: TEST_SESSION });

    // Assert
    expect(screen.getByRole("link", { name: "Todos" }).getAttribute("href")).toBe("/todos");
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeDefined();
  });
});

describe("header auth actions", () => {
  it("signs out from the desktop header", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    await renderHeader({ initialEntry: "/todos", session: TEST_SESSION });

    // Act
    await user.click(screen.getByRole("button", { name: "Sign Out" }));
    await user.click(
      within(await screen.findByRole("dialog", { name: "Sign out?" })).getByRole("button", {
        name: "Sign Out",
      }),
    );

    // Assert
    expect(signOut).toHaveBeenCalledWith();
  });

  it("shows sign in in the mobile drawer without a session", async () => {
    expect.assertions(4);

    // Arrange
    const error = vi.spyOn(console, "error");
    const warning = vi.spyOn(console, "warn");
    const user = userEvent.setup();
    await renderHeader({ session: null });

    // Act
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const drawer = await screen.findByRole("dialog");

    // Assert
    expect(within(drawer).getByRole("button", { name: "Sign in" })).toBeDefined();
    expect(within(drawer).queryByRole("link", { name: "Todos" })).toBeNull();
    expect(error).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  });

  it("signs out from the mobile drawer", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    await renderHeader({ initialEntry: "/todos", session: TEST_SESSION });
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const drawer = await screen.findByRole("dialog");
    const todos = within(drawer).getByRole("link", { name: "Todos" });

    // Act
    await user.click(within(drawer).getByRole("button", { name: "Sign Out" }));
    await user.click(
      within(await screen.findByRole("dialog", { name: "Sign out?" })).getByRole("button", {
        name: "Sign Out",
      }),
    );

    // Assert
    expect(todos.getAttribute("href")).toBe("/todos");
    expect(signOut).toHaveBeenCalledWith();
  });
});

describe("mobile navigation", () => {
  it("closes the drawer after choosing a navigation link", async () => {
    expect.assertions(3);

    // Arrange
    const user = userEvent.setup();
    await renderHeader();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const drawer = await screen.findByRole("dialog");
    const aboutLink = within(drawer).getByRole("link", { name: "About" });

    // Act
    await user.click(aboutLink);

    // Assert
    expect(aboutLink.getAttribute("role")).toBe("link");
    expect(aboutLink.getAttribute("href")).toBe("/about");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});

describe("header theme preference", () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset["theme"];
  });

  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset["theme"];
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";
  });

  it.each([
    ["invalid", "Theme: System. Switch to Light", "light"],
    ["system", "Theme: System. Switch to Light", "light"],
    ["light", "Theme: Light. Switch to Dark", "light"],
    ["dark", "Theme: Dark. Switch to System", "dark"],
  ])("restores %s before the header mounts", async (saved, label, scheme) => {
    expect.assertions(2);
    // Arrange
    localStorage.setItem("theme", saved);
    applyTheme();

    // Act
    await renderHeader();
    const control = screen.getByRole("button", { name: label });

    // Assert
    expect(control).toBeDefined();
    expect(document.documentElement.style.colorScheme).toBe(scheme);
  });

  it("cycles through all preferences from the header", async () => {
    expect.assertions(2);
    // Arrange
    const user = userEvent.setup();
    applyTheme();
    await renderHeader();

    // Act
    await user.click(screen.getByRole("button", { name: "Theme: System. Switch to Light" }));
    await user.click(screen.getByRole("button", { name: "Theme: Light. Switch to Dark" }));
    await user.click(screen.getByRole("button", { name: "Theme: Dark. Switch to System" }));

    // Assert
    expect(screen.getByRole("button", { name: "Theme: System. Switch to Light" })).toBeDefined();
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("uses system when storage cannot be read", async () => {
    expect.assertions(1);
    // Arrange
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    applyTheme();

    // Act
    await renderHeader();

    // Assert
    expect(screen.getByRole("button", { name: "Theme: System. Switch to Light" })).toBeDefined();
  });

  it("still switches when storage cannot be written", async () => {
    expect.assertions(2);
    // Arrange
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    applyTheme();
    await renderHeader();

    // Act
    await user.click(screen.getByRole("button", { name: "Theme: System. Switch to Light" }));

    // Assert
    expect(screen.getByRole("button", { name: "Theme: Light. Switch to Dark" })).toBeDefined();
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("follows the device until the visitor chooses an override", async () => {
    expect.assertions(2);
    // Arrange
    const user = userEvent.setup();
    const device = matchMedia("(prefers-color-scheme: dark)");
    const matches = vi.spyOn(device, "matches", "get").mockReturnValue(false);
    vi.spyOn(window, "matchMedia").mockReturnValue(device);
    applyTheme();
    await renderHeader();

    // Act
    matches.mockReturnValue(true);
    act(() => {
      device.dispatchEvent(new Event("change"));
    });
    const systemScheme = document.documentElement.style.colorScheme;
    await user.click(screen.getByRole("button", { name: "Theme: System. Switch to Light" }));
    act(() => {
      device.dispatchEvent(new Event("change"));
    });

    // Assert
    expect(systemScheme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("renders the system choice on the server without browser preferences", async () => {
    expect.assertions(1);
    // Arrange
    const { router, wrapper: Wrapper } = createTestingWrapper({ context: { session: null } });
    await router.load();

    // Act
    const view = renderToString(
      <Wrapper>
        <Header />
      </Wrapper>,
    );

    // Assert
    expect(view).toContain("Theme: System. Switch to Light");
  });
});
