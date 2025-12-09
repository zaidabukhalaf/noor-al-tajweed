<script setup lang="ts">
/**
 * Settings Page (/settings/page.vue)
 *
 * User preferences for font size, theme, effects, and more.
 */

import type { ThemeMode, EffectsIntensity, AppLanguage } from "~/types";

const { settings, updateSetting, resetSettings, t } = useAppSettings();

// Theme options
const themeOptions: { value: ThemeMode; label: { ar: string; en: string } }[] =
  [
    { value: "light", label: { ar: "فاتح", en: "Light" } },
    { value: "dark", label: { ar: "داكن", en: "Dark" } },
    { value: "auto", label: { ar: "تلقائي", en: "Auto" } },
  ];

// Effects intensity options
const effectsOptions: {
  value: EffectsIntensity;
  label: { ar: string; en: string };
}[] = [
  { value: "off", label: { ar: "إيقاف", en: "Off" } },
  { value: "low", label: { ar: "منخفض", en: "Low" } },
  { value: "normal", label: { ar: "عادي", en: "Normal" } },
];

// Language options
const languageOptions: {
  value: AppLanguage;
  label: { ar: string; en: string };
}[] = [
  { value: "ar", label: { ar: "العربية", en: "Arabic" } },
  { value: "en", label: { ar: "English", en: "English" } },
];

// Handle theme change
function onThemeChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  updateSetting("theme", target.value as ThemeMode);
}

// Handle language change
function onLanguageChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  updateSetting("language", target.value as AppLanguage);
}

// Handle effects change
function onEffectsChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  updateSetting("effectsIntensity", target.value as EffectsIntensity);
}

// Handle font size change
function onFontSizeChange(event: Event) {
  const target = event.target as HTMLInputElement;
  updateSetting("fontSize", Number(target.value));
}

// Handle toggle changes
function toggleKidsMode() {
  updateSetting("kidsMode", !settings.value.kidsMode);
}

function toggleLegend() {
  updateSetting("showLegend", !settings.value.showLegend);
}

function toggleCamera() {
  updateSetting("showCamera", !settings.value.showCamera);
}

// Confirm reset
function confirmReset() {
  const message =
    settings.value.language === "ar"
      ? "هل تريد إعادة جميع الإعدادات إلى الافتراضية؟"
      : "Reset all settings to default?";

  if (confirm(message)) {
    resetSettings();
  }
}

// SEO
useHead({
  title: t("نور التجويد - الإعدادات", "Noor Tajweed - Settings"),
});
</script>

<template>
  <div
    class="settings-page container container--narrow"
    :class="{ 'settings-page--kids': settings.kidsMode }"
  >
    <h1 class="page-title">
      {{ t("الإعدادات", "Settings") }}
    </h1>

    <!-- Appearance Section -->
    <section class="settings-section">
      <h2 class="section-title">
        <span class="icon">🎨</span>
        {{ t("المظهر", "Appearance") }}
      </h2>

      <div class="settings-card card">
        <!-- Theme -->
        <div class="setting-row">
          <div class="setting-info">
            <label for="theme-select" class="setting-label">
              {{ t("السمة", "Theme") }}
            </label>
            <p class="setting-description">
              {{
                t(
                  "اختر المظهر الفاتح أو الداكن",
                  "Choose light or dark appearance"
                )
              }}
            </p>
          </div>
          <div class="select-wrapper">
            <select
              id="theme-select"
              class="setting-select"
              :value="settings.theme"
              @change="onThemeChange"
            >
              <option
                v-for="option in themeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{
                  settings.language === "ar" ? option.label.ar : option.label.en
                }}
              </option>
            </select>
          </div>
        </div>

        <!-- Language -->
        <div class="setting-row">
          <div class="setting-info">
            <label for="language-select" class="setting-label">
              {{ t("اللغة", "Language") }}
            </label>
            <p class="setting-description">
              {{ t("لغة واجهة التطبيق", "App interface language") }}
            </p>
          </div>
          <div class="select-wrapper">
            <select
              id="language-select"
              class="setting-select"
              :value="settings.language"
              @change="onLanguageChange"
            >
              <option
                v-for="option in languageOptions"
                :key="option.value"
                :value="option.value"
              >
                {{
                  settings.language === "ar" ? option.label.ar : option.label.en
                }}
              </option>
            </select>
          </div>
        </div>

        <!-- Font Size -->
        <div class="setting-row">
          <div class="setting-info">
            <label for="font-size-range" class="setting-label">
              {{ t("حجم خط القرآن", "Qur'an Font Size") }}
            </label>
            <p class="setting-description">
              {{
                t(
                  "تكبير أو تصغير نص القرآن",
                  "Increase or decrease Qur'an text size"
                )
              }}
            </p>
          </div>
          <div class="setting-range-container">
            <input
              id="font-size-range"
              type="range"
              class="setting-range"
              min="18"
              max="40"
              step="2"
              :value="settings.fontSize"
              @input="onFontSizeChange"
            />
            <span class="range-value">{{ settings.fontSize }}px</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Content Preview -->
    <section class="settings-section">
      <h2 class="section-title">
        <span class="icon">👁️</span>
        {{ t("معاينة النص", "Text Preview") }}
      </h2>

      <div class="settings-card card">
        <p
          class="quran-text font-preview"
          :style="{ fontSize: `${settings.fontSize}px` }"
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
      </div>
    </section>

    <!-- Effects Section -->
    <section class="settings-section">
      <h2 class="section-title">
        <span class="icon">✨</span>
        {{ t("التأثيرات", "Effects") }}
      </h2>

      <div class="settings-card card">
        <!-- Effects Intensity -->
        <div class="setting-row">
          <div class="setting-info">
            <label for="effects-select" class="setting-label">
              {{ t("شدة التأثيرات", "Effects Intensity") }}
            </label>
            <p class="setting-description">
              {{
                t(
                  "التأثيرات ثلاثية الأبعاد والحركات",
                  "3D effects and animations"
                )
              }}
            </p>
          </div>
          <div class="select-wrapper">
            <select
              id="effects-select"
              class="setting-select"
              :value="settings.effectsIntensity"
              @change="onEffectsChange"
            >
              <option
                v-for="option in effectsOptions"
                :key="option.value"
                :value="option.value"
              >
                {{
                  settings.language === "ar" ? option.label.ar : option.label.en
                }}
              </option>
            </select>
          </div>
        </div>

        <!-- Show Legend -->
        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">
              {{ t("عرض دليل الألوان", "Show Color Legend") }}
            </label>
            <p class="setting-description">
              {{
                t(
                  "إظهار شرح ألوان التجويد",
                  "Display tajwīd color explanations"
                )
              }}
            </p>
          </div>
          <button
            class="toggle-btn"
            :class="{ 'toggle-btn--active': settings.showLegend }"
            :aria-pressed="settings.showLegend"
            @click="toggleLegend"
            aria-label="Toggle Legend"
          >
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- Mode Section -->
    <section class="settings-section">
      <h2 class="section-title">
        <span class="icon">🚀</span>
        {{ t("الأوضاع", "Modes") }}
      </h2>

      <div class="settings-card card">
        <!-- Kids Mode -->
        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">
              {{ t("وضع الأطفال", "Kids Mode") }}
            </label>
            <p class="setting-description">
              {{
                t(
                  "نص أكبر وواجهة مبسطة وملونة",
                  "Larger text and playful, colorful interface"
                )
              }}
            </p>
          </div>
          <button
            class="toggle-btn"
            :class="{ 'toggle-btn--active': settings.kidsMode }"
            :aria-pressed="settings.kidsMode"
            @click="toggleKidsMode"
            aria-label="Toggle Kids Mode"
          >
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
          </button>
        </div>

        <!-- Camera -->
        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label">
              {{ t("الكاميرا الأمامية", "Front Camera") }}
            </label>
            <p class="setting-description">
              {{
                t(
                  "عرض صورة الكاميرا أثناء التلاوة",
                  "Show camera feed during recitation"
                )
              }}
            </p>
          </div>
          <button
            class="toggle-btn"
            :class="{ 'toggle-btn--active': settings.showCamera }"
            :aria-pressed="settings.showCamera"
            @click="toggleCamera"
            aria-label="Toggle Camera"
          >
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- Reset Section -->
    <section class="settings-section">
      <div class="settings-card card settings-card--danger">
        <div class="setting-row">
          <div class="setting-info">
            <label class="setting-label text-error">
              {{ t("إعادة تعيين الإعدادات", "Reset Settings") }}
            </label>
            <p class="setting-description">
              {{
                t(
                  "إرجاع جميع الإعدادات إلى الافتراضية",
                  "Restore all settings to default"
                )
              }}
            </p>
          </div>
          <button class="btn btn--danger-outline" @click="confirmReset">
            {{ t("إعادة تعيين", "Reset") }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings-page {
  padding-top: var(--space-8);
  padding-bottom: var(--space-12);
}

.page-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-8);
  text-align: center;
}

/* Sections */
.settings-section {
  margin-bottom: var(--space-8);
}

.section-title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-3);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.icon {
  font-size: 1.25rem;
}

.settings-card {
  padding: var(--space-2) var(--space-5);
}

.settings-card--danger {
  border: 1px solid var(--highlight-error);
  background-color: rgba(239, 68, 68, 0.05);
}

/* Setting Row */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) 0;
}

.setting-row:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: var(--text-base);
  font-weight: 600;
  display: block;
  margin-bottom: var(--space-1);
}

.setting-description {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}

.text-error {
  color: var(--highlight-error);
}

/* Select Input */
.select-wrapper {
  position: relative;
}

.setting-select {
  appearance: none;
  min-width: 140px;
  padding: var(--space-2) var(--space-8) var(--space-2) var(--space-4);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  transition: all var(--transition-fast);
}

[dir="rtl"] .setting-select {
  padding: var(--space-2) var(--space-4) var(--space-2) var(--space-8);
  background-position: left 12px center;
}

.setting-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
}

/* Range Input */
.setting-range-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 180px;
}

.setting-range {
  flex: 1;
  height: 6px;
  border-radius: var(--border-radius-full);
  background: var(--bg-tertiary);
  appearance: none;
  cursor: pointer;
}

.setting-range::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform var(--transition-fast);
}

.setting-range::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.range-value {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  min-width: 50px;
  text-align: center;
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Toggle Button (iOS Style) */
.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.toggle-track {
  display: block;
  width: 50px;
  height: 28px;
  border-radius: var(--border-radius-full);
  background-color: var(--bg-tertiary);
  position: relative;
  transition: background-color 0.3s ease;
  border: 2px solid transparent;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-btn--active .toggle-track {
  background-color: var(--color-success, #22c55e);
}

.toggle-btn--active .toggle-thumb {
  transform: translateX(22px);
}

/* Font Preview */
.font-preview {
  text-align: center;
  padding: var(--space-4);
  margin: 0;
  color: var(--text-primary);
}

/* Danger Button */
.btn--danger-outline {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: 1px solid var(--highlight-error);
  color: var(--highlight-error);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.btn--danger-outline:hover {
  background: var(--highlight-error);
  color: white;
}

/* Kids Mode Overrides */
.settings-page--kids {
  --color-primary: #f39c12;
}

.settings-page--kids .page-title {
  color: #d35400;
  font-family: var(--font-ui);
  font-weight: 800;
}

.settings-page--kids .section-title {
  color: #8e44ad;
  font-weight: 700;
}

.settings-page--kids .settings-card {
  border: 3px solid #f1c40f;
  border-radius: 1.5rem;
  background: #fff;
}

.settings-page--kids .toggle-btn--active .toggle-track {
  background-color: #2ecc71;
}

/* Responsive */
@media (max-width: 640px) {
  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .select-wrapper,
  .setting-select,
  .setting-range-container {
    width: 100%;
    min-width: auto;
  }

  .setting-row > button.btn,
  .toggle-btn {
    align-self: flex-end;
  }
}
</style>
