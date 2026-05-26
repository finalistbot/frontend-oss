import { THEME_STORAGE_KEY } from "./constants";

export function themeInitScript() {
  return `(() => {
    const storageKey = "${THEME_STORAGE_KEY}";
    const root = document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const stored = window.localStorage.getItem(storageKey);
    const theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    const resolvedTheme = theme === "system" ? systemTheme : theme;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  })();`;
}
