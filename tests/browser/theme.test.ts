import { expect, test } from "./fixtures";
import { HomePage } from "./page-objects";

test("cycles the navbar theme using pointer and keyboard", async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await expect(home.theme.button).toHaveAccessibleName("Theme: System. Switch to Light");

  await home.theme.cycle();
  await expect(home.theme.button).toHaveAccessibleName("Theme: Light. Switch to Dark");

  await home.theme.activateWithEnter();
  await expect(home.theme.button).toHaveAccessibleName("Theme: Dark. Switch to System");

  await home.theme.activateWithSpace();
  await expect(home.theme.button).toHaveAccessibleName("Theme: System. Switch to Light");
});

test("shows the selected preference's icon", async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await expect.poll(async () => await home.theme.iconClass()).toContain("lucide-monitor");
  await home.theme.cycle();
  await expect.poll(async () => await home.theme.iconClass()).toContain("lucide-sun");
  await home.theme.cycle();
  await expect.poll(async () => await home.theme.iconClass()).toContain("lucide-moon");
});

test("remembers appearance across navigation and reload", async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.theme.chooseDark();
  await home.navigateToAbout();
  await home.reload();

  await expect(home.theme.button).toHaveAccessibleName("Theme: Dark. Switch to System");
  await expect(home.theme.document).toHaveCSS("color-scheme", "dark");
  await expect(home.theme.navbar).toHaveCSS("background-color", "oklch(0.145 0 0)");
});

test("system follows live device changes", async ({ page }) => {
  const home = new HomePage(page);
  await page.emulateMedia({ colorScheme: "dark" });
  await home.goto();
  await expect(home.theme.document).toHaveCSS("color-scheme", "dark");
  await expect.poll(async () => await home.theme.iconClass()).toContain("lucide-monitor");

  await page.emulateMedia({ colorScheme: "light" });
  await expect(home.theme.document).toHaveCSS("color-scheme", "light");
});

test("explicit light ignores a device change to dark", async ({ page }) => {
  const home = new HomePage(page);
  await page.emulateMedia({ colorScheme: "light" });
  await home.goto();
  await home.theme.cycle();
  await page.emulateMedia({ colorScheme: "dark" });

  await expect(home.theme.document).toHaveCSS("color-scheme", "light");
  await expect(home.theme.navbar).toHaveCSS("background-color", "oklch(1 0 0)");
});

test("explicit dark ignores the device until returning to system", async ({ page }) => {
  const home = new HomePage(page);
  await page.emulateMedia({ colorScheme: "dark" });
  await home.goto();
  await home.theme.chooseDark();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(home.theme.document).toHaveCSS("color-scheme", "dark");

  await home.theme.cycle();
  await expect(home.theme.document).toHaveCSS("color-scheme", "light");
});

test("keeps the theme button visible beside the mobile menu", async ({ page }) => {
  const home = new HomePage(page);
  await page.setViewportSize({ height: 812, width: 375 });
  await home.goto();
  await home.theme.cycle();

  await expect(home.theme.button).toBeVisible();
  await expect(home.theme.menu).toBeVisible();
  await expect(home.theme.button).toHaveAccessibleName("Theme: Light. Switch to Dark");
});

test("switches without storage and defaults to system on a fresh visit", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(globalThis, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    });
  });
  const home = new HomePage(page);
  await page.emulateMedia({ colorScheme: "light" });
  await home.goto();
  await home.theme.chooseDark();
  await home.navigateToAbout();
  await expect(home.theme.document).toHaveCSS("color-scheme", "dark");

  await home.reload();
  await expect(home.theme.button).toHaveAccessibleName("Theme: System. Switch to Light");
  await expect(home.theme.document).toHaveCSS("color-scheme", "light");
});

test("applies a saved theme before hydration", async ({ page }) => {
  const home = new HomePage(page);
  await page.emulateMedia({ colorScheme: "light" });
  await home.goto();
  await home.theme.chooseDark();
  await home.gotoBeforeHydration();
  const hydrated = await home.theme.isHydrated();

  expect(hydrated).toBe(false);
  await expect(home.theme.document).toHaveCSS("color-scheme", "dark");
  await expect(home.theme.navbar).toHaveCSS("background-color", "oklch(0.145 0 0)");
});

test("applies the device preference before hydration on a first visit", async ({ page }) => {
  const home = new HomePage(page);
  await page.emulateMedia({ colorScheme: "dark" });
  await home.gotoBeforeHydration();
  const hydrated = await home.theme.isHydrated();

  expect(hydrated).toBe(false);
  await expect(home.theme.document).toHaveCSS("color-scheme", "dark");
  await expect(home.theme.navbar).toHaveCSS("background-color", "oklch(0.145 0 0)");
});
