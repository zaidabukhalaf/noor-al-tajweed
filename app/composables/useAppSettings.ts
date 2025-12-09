/**
 * useAppSettings Composable
 *
 * Manages application settings with localStorage persistence.
 */

import type {
  AppSettings,
  ThemeMode,
  AppLanguage,
  EffectsIntensity,
} from "~/types";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  language: "ar",
  fontSize: 24,
  effectsIntensity: "normal",
  kidsMode: false,
  showLegend: true,
  showCamera: false,
};

export function useAppSettings() {
  // Initialize with defaults
  const settings = useState<AppSettings>("appSettings", () => {
    // Try to load from localStorage on client
    if (import.meta.client) {
      const saved = localStorage.getItem("noor-tajweed-settings");
      if (saved) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch {
          // Ignore parse errors
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Persist to localStorage when settings change
  watch(
    settings,
    (newSettings) => {
      if (import.meta.client) {
        localStorage.setItem(
          "noor-tajweed-settings",
          JSON.stringify(newSettings)
        );
      }
    },
    { deep: true }
  );

  // Apply theme to document
  watch(
    () => settings.value.theme,
    (theme) => {
      if (import.meta.client) {
        applyTheme(theme);
      }
    },
    { immediate: true }
  );

  // Apply language/direction to document
  watch(
    () => settings.value.language,
    (lang) => {
      if (import.meta.client) {
        applyLanguage(lang);
      }
    },
    { immediate: true }
  );

  /**
   * Apply theme to document
   */
  function applyTheme(theme: ThemeMode) {
    if (!import.meta.client) return;

    const root = document.documentElement;

    if (theme === "auto") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }

  /**
   * Apply language direction
   */
  function applyLanguage(lang: AppLanguage) {
    if (!import.meta.client) return;

    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }

  /**
   * Update a specific setting
   */
  function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) {
    settings.value = { ...settings.value, [key]: value };
  }

  /**
   * Toggle theme between light and dark
   */
  function toggleTheme() {
    const current = settings.value.theme;
    const next: ThemeMode = current === "light" ? "dark" : "light";
    updateSetting("theme", next);
  }

  /**
   * Toggle language between ar and en
   */
  function toggleLanguage() {
    const current = settings.value.language;
    const next: AppLanguage = current === "ar" ? "en" : "ar";
    updateSetting("language", next);
  }

  /**
   * Reset to default settings
   */
  function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS };
  }

  // Translation helper
  function t(ar: string, en: string): string {
    return settings.value.language === "ar" ? ar : en;
  }

  // Computed helpers
  const isRTL = computed(() => settings.value.language === "ar");
  const isDarkMode = computed(() => {
    if (settings.value.theme === "auto") {
      if (import.meta.client) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return false;
    }
    return settings.value.theme === "dark";
  });

  return {
    settings: readonly(settings),
    isRTL,
    isDarkMode,

    updateSetting,
    toggleTheme,
    toggleLanguage,
    resetSettings,
    t,
  };
}
