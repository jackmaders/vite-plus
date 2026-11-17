export const THEME_INIT_SCRIPT = `(() => {
  let preference = "system";
  try {
    preference = localStorage.getItem("theme") ?? "system";
  } catch {
    // Storage restrictions must not prevent using the system preference.
  }

  preference = preference === "light" || preference === "dark" ? preference : "system";
  const dark =
    preference === "dark" ||
    (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset["theme"] = preference;
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
})();`;

/** Applies a browser preference to the document and persists explicit choices. */
export function applyTheme(preference?: string) {
  let selected = preference;
  try {
    if (selected === undefined) {
      selected = localStorage.getItem("theme") ?? "system";
    } else {
      localStorage.setItem("theme", selected);
    }
  } catch {
    // Storage restrictions must not prevent in-memory theme changes.
  }

  selected = selected === "light" || selected === "dark" ? selected : "system";
  const dark =
    selected === "dark" ||
    (selected === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset["theme"] = selected;
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}
