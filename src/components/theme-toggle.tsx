import { useState } from "react";

type ThemeMode = "auto" | "dark" | "light";

const NEXT_THEME_MODE: Record<ThemeMode, ThemeMode> = {
  auto: "light",
  dark: "auto",
  light: "dark",
};
const THEME_LABEL: Record<ThemeMode, string> = {
  auto: "Auto",
  dark: "Dark",
  light: "Light",
};

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("auto");

  function toggleMode() {
    const nextMode = NEXT_THEME_MODE[mode];
    setMode(nextMode);
    if (nextMode === "auto") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = nextMode;
    }
  }

  const label =
    mode === "auto"
      ? "Theme mode: auto (system). Click to switch to light mode."
      : `Theme mode: ${mode}. Click to switch mode.`;
  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5"
    >
      {THEME_LABEL[mode]}
    </button>
  );
}
