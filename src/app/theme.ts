/** Applies a browser preference. Keep self-contained: the root serializes it before hydration. */
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
