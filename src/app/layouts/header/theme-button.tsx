import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

import { Button } from "@/shared/ui/shadcn/button";

import { applyTheme } from "../../theme";

const choices = {
  dark: { icon: Moon, label: "Dark", next: "system" },
  light: { icon: Sun, label: "Light", next: "dark" },
  system: { icon: Monitor, label: "System", next: "light" },
} as const;

export function ThemeButton() {
  const preference = useSyncExternalStore(subscribe, getPreference, getServerPreference);
  useEffect(() => {
    const device = matchMedia("(prefers-color-scheme: dark)");
    function update() {
      if (document.documentElement.dataset["theme"] === "system") {
        applyTheme("system");
      }
    }
    if (preference === "system") {
      device.addEventListener("change", update);
      update();
    }
    return () => {
      device.removeEventListener("change", update);
    };
  }, [preference]);

  const { icon: Icon, label, next } = choices[preference];
  return (
    <Button
      aria-label={`Theme: ${label}. Switch to ${choices[next].label}`}
      variant="ghost"
      size="icon"
      onClick={() => {
        applyTheme(next);
      }}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => {
    observer.disconnect();
  };
}

function getPreference() {
  const selected = document.documentElement.dataset["theme"];
  return selected === "light" || selected === "dark" ? selected : "system";
}

function getServerPreference() {
  return "system" as const;
}
