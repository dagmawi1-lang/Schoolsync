export const SETTINGS_STORAGE_KEY = "schoolsync-settings";

export function applyTheme(theme) {
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const actualTheme =
    theme === "system"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : theme === "dark"
        ? "dark"
        : "light";

  document.documentElement.dataset.theme = actualTheme;
}