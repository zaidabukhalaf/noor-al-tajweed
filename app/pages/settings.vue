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
  <div class="settings-page container container--narrow">
    <h1 class="page-title">
      {{ t("الإعدادات", "Settings") }}
    </h1>

    <!-- Appearance Section -->
    <section class="settings-section">
      <h2 class="section-title">
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

    <!-- Effects Section -->
    <section class="settings-section">
      <h2 class="section-title">
        {{ t("التأثيرات البصرية", "Visual Effects") }}
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
                  "نص أكبر وواجهة مبسطة",
                  "Larger text and simplified interface"
                )
              }}
            </p>
          </div>
          <button
            class="toggle-btn"
            :class="{ 'toggle-btn--active': settings.kidsMode }"
            :aria-pressed="settings.kidsMode"
            @click="toggleKidsMode"
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
            <label class="setting-label">
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
          <button class="btn btn--secondary" @click="confirmReset">
            {{ t("إعادة تعيين", "Reset") }}
          </button>
        </div>
      </div>
    </section>

    <!-- Font Preview -->
    <section class="settings-section">
      <h2 class="section-title">
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
  </div>
</template>

<style scoped>
.settings-page {
  padding-top: var(--space-4);
  padding-bottom: var(--space-8);
}

.page-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-8);
  text-align: center;
}

/* Sections */
.settings-section {
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-3);
  color: var(--text-secondary);
}

.settings-card {
  padding: var(--space-4);
}

.settings-card--danger {
  border-color: var(--highlight-error);
}

/* Setting Row */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
}

.setting-row:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-weight: 600;
  display: block;
  margin-bottom: var(--space-1);
}

.setting-description {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}

/* Select Input */
.setting-select {
  min-width: 140px;
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
}

/* Range Input */
.setting-range-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 160px;
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
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

.range-value {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: right;
}

/* Toggle Button */
.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.toggle-track {
  display: block;
  width: 48px;
  height: 28px;
  border-radius: var(--border-radius-full);
  background-color: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  position: relative;
  transition: all var(--transition-fast);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--text-muted);
  transition: all var(--transition-fast);
}

.toggle-btn--active .toggle-track {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.toggle-btn--active .toggle-thumb {
  left: 22px;
  background-color: white;
}

/* Font Preview */
.font-preview {
  text-align: center;
  padding: var(--space-4);
  margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .setting-select,
  .setting-range-container {
    width: 100%;
    min-width: auto;
  }
}
</style>
